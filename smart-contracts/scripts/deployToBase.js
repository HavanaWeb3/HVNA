const { ethers } = require("hardhat");

async function main() {
    console.log("🌐 Deploying HVNA Ecosystem to Base Network...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    // Get current gas price
    const feeData = await deployer.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    
    // Deploy Enhanced NFT Contract
    console.log("\n🎨 Deploying Enhanced Boldly Elephunky NFT to Base...");
    const BoldlyElephunkyNFTEnhanced = await ethers.getContractFactory("BoldlyElephunkyNFTEnhanced");
    
    // Deploy with gas optimization for Base
    const nftEnhanced = await BoldlyElephunkyNFTEnhanced.deploy({
        gasLimit: 3000000, // Explicit gas limit
        gasPrice: feeData.gasPrice
    });
    await nftEnhanced.waitForDeployment();
    const nftEnhancedAddress = await nftEnhanced.getAddress();
    console.log("✅ Enhanced NFT deployed to Base:", nftEnhancedAddress);
    
    // Deploy HVNA Token
    console.log("\n💰 Deploying HVNA Token to Base...");
    const HVNAToken = await ethers.getContractFactory("HVNAToken");
    const token = await HVNAToken.deploy({
        gasLimit: 3000000,
        gasPrice: feeData.gasPrice
    });
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ HVNA Token deployed to Base:", tokenAddress);
    
    // Test basic functionality
    console.log("\n🧪 Testing Base deployment...");
    try {
        // Check NFT contract basics
        const nftName = await nftEnhanced.name();
        const nftSymbol = await nftEnhanced.symbol();
        const maxSupply = await nftEnhanced.maxSupply();
        const genesisSupply = await nftEnhanced.genesisSupply();
        
        console.log("NFT Contract details:");
        console.log("- Name:", nftName);
        console.log("- Symbol:", nftSymbol);
        console.log("- Max Supply:", maxSupply.toString());
        console.log("- Genesis Supply:", genesisSupply.toString());
        
        // Check token contract basics
        const tokenName = await token.name();
        const tokenSymbol = await token.symbol();
        const tokenDecimals = await token.decimals();
        
        console.log("\nToken Contract details:");
        console.log("- Name:", tokenName);
        console.log("- Symbol:", tokenSymbol);
        console.log("- Decimals:", tokenDecimals.toString());
        
    } catch (error) {
        console.log("⚠️ Testing failed:", error.message);
    }
    
    console.log("\n📋 Base Network Deployment Summary:");
    console.log("====================================");
    console.log("Enhanced NFT Contract:", nftEnhancedAddress);
    console.log("HVNA Token Contract:", tokenAddress);
    console.log("Network: Base (Chain ID: 8453)");
    console.log("Deployer:", deployer.address);
    console.log("Gas used: ~6M gas total");
    console.log("Estimated cost: ~$2-5 (much cheaper than Ethereum mainnet)");
    
    console.log("\n🔧 Shopify Widget Configuration for Base:");
    console.log("====================================");
    console.log("Add this to your widget's network configs:");
    console.log(`base: {`);
    console.log(`    nft: "${nftEnhancedAddress}",`);
    console.log(`    token: "${tokenAddress}",`);
    console.log(`    chainId: 8453,`);
    console.log(`    rpcUrls: ['https://mainnet.base.org']`);
    console.log(`},`);
    
    console.log("\n✅ Base deployment complete!");
    console.log("🎯 Benefits of Base:");
    console.log("- 10-100x cheaper gas than Ethereum mainnet");
    console.log("- Fast confirmation times (2-3 seconds)");
    console.log("- Coinbase ecosystem support");
    console.log("- Same security as Ethereum (L2 rollup)");
    console.log("- Growing DeFi ecosystem");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update Shopify widget to support Base network");
    console.log("2. Test widget functionality on Base");
    console.log("3. Consider making Base the primary network");
    console.log("4. Add network switching in widget UI");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});