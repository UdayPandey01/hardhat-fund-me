const {assert} = require("chai")
const {network, ethers, getNamedAccounts, deployments} = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async function () {

        let deployer, fundMe
        const sendValue = ethers.utils.parseEther("0.1")

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            const fundMeDeployment = await deployments.get("FundMe")
            fundMe = await ethers.getContractAt(fundMeDeployment.abi, fundMeDeployment.address)
        })

        it("allows people to fund and withdraw", async function () {
            const fundTxResponse = await fundMe.fund({value: sendValue})
            await fundTxResponse.wait()

            const withdrawTxResponse = await fundMe.withdraw();
            await withdrawTxResponse.wait()

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            assert.equal(endingFundMeBalance.toString(), "0")
        })
    })