const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("Deploying TokenPreSale contract with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Contract addresses (update these with your deployed contract addresses)
    const HVNA_TOKEN_ADDRESS = process.env.HVNA_TOKEN_ADDRESS || ""; // Deploy HVNAToken first
    const GENESIS_NFT_ADDRESS = process.env.GENESIS_NFT_ADDRESS || ""; // Your BoldlyElephunkyNFT address
    
    if (!HVNA_TOKEN_ADDRESS || !GENESIS_NFT_ADDRESS) {
        throw new Error("Please set HVNA_TOKEN_ADDRESS and GENESIS_NFT_ADDRESS in your .env file");
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
    
    // Deploy TokenPreSale contract
    const TokenPreSale = await hre.ethers.getContractFactory("TokenPreSale");
    const tokenPreSale = await TokenPreSale.deploy(
        HVNA_TOKEN_ADDRESS,
        GENESIS_NFT_ADDRESS,
        GENESIS_PHASE_START,
        GENESIS_PHASE_END,
        PUBLIC_PHASE_START,
        PUBLIC_PHASE_END
    );
    
    await tokenPreSale.deployed();
    
    console.log("TokenPreSale deployed to:", tokenPreSale.address);
    console.log("Transaction hash:", tokenPreSale.deployTransaction.hash);
    
    // Wait for a few block confirmations
    console.log("Waiting for block confirmations...");
    await tokenPreSale.deployTransaction.wait(5);
    
    // Verify deployment
    console.log("Verifying deployment...");
    const genesisPrice = await tokenPreSale.genesisPrice();
    const publicPrice = await tokenPreSale.publicPrice();
    const maxTokens = await tokenPreSale.maxTokensForPreSale();
    
    console.log("Genesis Price:", hre.ethers.utils.formatEther(genesisPrice), "ETH per token");
    console.log("Public Price:", hre.ethers.utils.formatEther(publicPrice), "ETH per token");
    console.log("Max Tokens for Pre-sale:", hre.ethers.utils.formatUnits(maxTokens, 18));
    
    // Prepare for token transfer
    console.log("\n=== IMPORTANT: Next Steps ===");
    console.log("1. Transfer pre-sale tokens to the contract:");
    console.log(`   - Contract address: ${tokenPreSale.address}`);
    console.log(`   - Amount: ${hre.ethers.utils.formatUnits(maxTokens, 18)} HVNA tokens`);
    console.log("2. Activate the sale: call toggleSale()");
    console.log("3. Update phase timing if needed: call setPhaseTiming()");
    
    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        tokenPreSaleAddress: tokenPreSale.address,
        hvnaTokenAddress: HVNA_TOKEN_ADDRESS,
        genesisNFTAddress: GENESIS_NFT_ADDRESS,
        genesisPhaseStart: GENESIS_PHASE_START,
        genesisPhaseEnd: GENESIS_PHASE_END,
        publicPhaseStart: PUBLIC_PHASE_START,
        publicPhaseEnd: PUBLIC_PHASE_END,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        transactionHash: tokenPreSale.deployTransaction.hash
    };
    
    console.log("\nDeployment Info:", JSON.stringify(deploymentInfo, null, 2));
    
    return tokenPreSale;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });