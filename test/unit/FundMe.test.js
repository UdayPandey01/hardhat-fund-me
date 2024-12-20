const { assert } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function() {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        console.log(`Deployer : ${deployer}`)
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContractAt("FundMe", deployer);
        mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator")
    })

    describe("constructor", async function (){
        it("set the aggrregator address correctly", async function() {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
})