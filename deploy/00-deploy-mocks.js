const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        // log(`Network name: ${network.name}`);
        // log("Local network detected! Deploying mocks...");
        // log(`DECIMALS: ${DECIMALS}, INITIAL_ANSWER: ${INITIAL_ANSWER}`);

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [0, 200000000000],
        });
        log("Mocks deployed!");
        log("------------------------------------------------------------");
    } else {
        log("Not a local network. Skipping mock deployment.");
    }
};

module.exports.tags = ["all", "mocks"];
