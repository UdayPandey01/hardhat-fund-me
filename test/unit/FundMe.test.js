const {assert, expect} = require("chai")
const {network, deployments, ethers, getNamedAccounts} = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
        let fundMe, mockV3Aggregator, deployer
        const sendValue = ethers.utils.parseEther("1")

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            const fundMeDeployment = await deployments.get("FundMe")
            const mockV3AggregatorDeployment = await deployments.get("MockV3Aggregator")
            fundMe = await ethers.getContractAt(
                fundMeDeployment.abi, fundMeDeployment.address
            )
            mockV3Aggregator = await ethers.getContractAt(
                mockV3AggregatorDeployment.abi, mockV3AggregatorDeployment.address
            )
        })

        describe("constructor", () => {
            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.priceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", () => {
            it("Fails if you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })
            it("Updates the amount funded data structure", async () => {
                await fundMe.fund({value: sendValue})
                const response = await fundMe.addressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })
            it("Adds funder to array of funders", async () => {
                await fundMe.fund({value: sendValue})
                const response = await fundMe.funders(0)
                assert.equal(response, deployer)
            })
        })

        describe("withdraw", () => {

            beforeEach(async () => {
                await fundMe.fund({value: sendValue})
            })

            it("is allows us to withdraw", async () => {
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({value: sendValue})
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const {gasUsed, effectiveGasPrice} = transactionReceipt
                const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                // Assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(withdrawGasCost).toString()
                )

                await expect(fundMe.funders(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
                }
            })

            it("Only allows the owner to withdraw", async () => {
                const accounts = await ethers.getSigners()
                const fundMeConnectedContract = await fundMe.connect(accounts[1])
                await expect(fundMeConnectedContract.withdraw())
                    .to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
            })
        })
    })