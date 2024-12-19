const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // Debugging: Check chainId and networkConfig
    log("Network Chain ID:", chainId);
    log("Network Config for Chain ID:", networkConfig[chainId]);

    // Fetch ethUsdPriceFeedAddress
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]?.ethUsdPriceFeed;

        // Error handling
        if (!ethUsdPriceFeedAddress) {
            throw new Error(`ethUsdPriceFeed is undefined for chainId: ${chainId}`);
        }
    }

    log("Price Feed Address:", ethUsdPriceFeedAddress);

    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("222")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args);
    }

    log("Deployment complete.");
};

module.exports.tags = ["all", "fundme"];
