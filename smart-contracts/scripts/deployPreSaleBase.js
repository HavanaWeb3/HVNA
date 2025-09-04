const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Deploying TokenPreSaleBase contract to Base network with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Base Network Contract Addresses
    const BASE_ETH_USD_PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"; // Chainlink ETH/USD on Base
    const HVNA_TOKEN_ADDRESS = process.env.HVNA_TOKEN_ADDRESS || ""; // Deploy HVNAToken on Base first
    const GENESIS_NFT_ADDRESS = process.env.GENESIS_NFT_ADDRESS || ""; // Your BoldlyElephunkyNFT on Base
    
    if (!HVNA_TOKEN_ADDRESS || !GENESIS_NFT_ADDRESS) {
        throw new Error("Please set HVNA_TOKEN_ADDRESS and GENESIS_NFT_ADDRESS in your .env file");
    }
    
    // Verify we're on Base network
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    if (network.chainId !== 8453) { // Base mainnet chain ID
        console.warn("⚠️  WARNING: Not deploying to Base mainnet (8453). Current chain:", network.chainId);
        console.log("Base mainnet: 8453, Base testnet: 84531");
    }
    
    // Pre-sale timing (timestamps in seconds)
    const now = Math.floor(Date.now() / 1000);
    const GENESIS_PHASE_START = process.env.GENESIS_PHASE_START || (now + 86400); // Start in 24 hours
    const GENESIS_PHASE_END = process.env.GENESIS_PHASE_END || (now + 86400 * 7); // 7 days for Genesis phase
    const PUBLIC_PHASE_START = process.env.PUBLIC_PHASE_START || (now + 86400 * 7 + 3600); // 1 hour gap
    const PUBLIC_PHASE_END = process.env.PUBLIC_PHASE_END || (now + 86400 * 30); // 30 days total pre-sale
    
    console.log("Phase timing:");
    console.log("Genesis Phase:", new Date(GENESIS_PHASE_START * 1000), "to", new Date(GENESIS_PHASE_END * 1000));
    console.log("Public Phase:", new Date(PUBLIC_PHASE_START * 1000), "to", new Date(PUBLIC_PHASE_END * 1000));
    
    // Deploy TokenPreSaleBase contract
    const TokenPreSaleBase = await hre.ethers.getContractFactory("TokenPreSaleBase");
    const tokenPreSale = await TokenPreSaleBase.deploy(
        HVNA_TOKEN_ADDRESS,
        GENESIS_NFT_ADDRESS,
        BASE_ETH_USD_PRICE_FEED,
        GENESIS_PHASE_START,
        GENESIS_PHASE_END,
        PUBLIC_PHASE_START,
        PUBLIC_PHASE_END
    );
    
    await tokenPreSale.deployed();
    
    console.log("TokenPreSaleBase deployed to:", tokenPreSale.address);
    console.log("Transaction hash:", tokenPreSale.deployTransaction.hash);
    
    // Wait for a few block confirmations
    console.log("Waiting for block confirmations...");
    await tokenPreSale.deployTransaction.wait(5);
    
    // Verify deployment and test price feed
    console.log("Verifying deployment...");
    try {
        const ethUsdPrice = await tokenPreSale.getETHUSDPrice();
        console.log("Current ETH/USD Price:", (ethUsdPrice / 10**8).toFixed(2));
        
        const tokenPriceUSDCents = await tokenPreSale.tokenPriceUSDCents();
        const genesisDiscountPercent = await tokenPreSale.genesisDiscountPercent();
        
        console.log("Token Price:", tokenPriceUSDCents.toNumber() / 100, "USD");
        console.log("Genesis Discount:", genesisDiscountPercent.toNumber(), "%");
        
        // Test price calculations
        const publicETHPrice = await tokenPreSale.getTokenPriceInETH(false);
        const genesisETHPrice = await tokenPreSale.getTokenPriceInETH(true);
        
        console.log("Public Price:", hre.ethers.utils.formatEther(publicETHPrice), "ETH per token");
        console.log("Genesis Price:", hre.ethers.utils.formatEther(genesisETHPrice), "ETH per token");
        
        const maxTokens = await tokenPreSale.maxTokensForPreSale();
        console.log("Max Tokens for Pre-sale:", hre.ethers.utils.formatUnits(maxTokens, 18));
        
    } catch (error) {
        console.error("⚠️  Error verifying deployment:", error.message);
    }
    
    // Prepare for token transfer
    console.log("\n=== IMPORTANT: Next Steps ===");
    console.log("1. Transfer pre-sale tokens to the contract:");
    console.log(`   - Contract address: ${tokenPreSale.address}`);
    console.log(`   - Network: Base (${network.chainId})`);
    console.log(`   - Amount: 15,000,000 HVNA tokens`);
    console.log("2. Activate the sale: call toggleSale()");
    console.log("3. Test Genesis NFT authentication with real holders");
    console.log("4. Monitor Chainlink price feed for accurate USD/ETH conversion");
    
    // Save deployment info
    const deploymentInfo = {
        network: `Base (${network.chainId})`,
        tokenPreSaleAddress: tokenPreSale.address,
        hvnaTokenAddress: HVNA_TOKEN_ADDRESS,
        genesisNFTAddress: GENESIS_NFT_ADDRESS,
        ethUsdPriceFeed: BASE_ETH_USD_PRICE_FEED,
        genesisPhaseStart: GENESIS_PHASE_START,
        genesisPhaseEnd: GENESIS_PHASE_END,
        publicPhaseStart: PUBLIC_PHASE_START,
        publicPhaseEnd: PUBLIC_PHASE_END,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        transactionHash: tokenPreSale.deployTransaction.hash,
        tokenPriceUSD: "$0.01",
        genesisDiscount: "30%"
    };
    
    console.log("\n=== Base Network Deployment Info ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Base-specific notes
    console.log("\n=== Base Network Notes ===");
    console.log("- Lower gas fees than Ethereum mainnet");
    console.log("- Compatible with Ethereum tooling (MetaMask, etc.)");
    console.log("- Chainlink price feeds available for real-time USD conversion");
    console.log("- Your Genesis NFTs are already on this network ✅");
    
    return tokenPreSale;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });