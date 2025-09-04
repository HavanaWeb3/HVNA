const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 HVNA Base Mainnet Deployment - PRODUCTION");
    console.log("=".repeat(50));
    
    const [deployer] = await ethers.getSigners();
    
    // Pre-flight checks
    console.log("✈️ Pre-flight Checks:");
    console.log("Deployer address:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceETH = parseFloat(ethers.formatEther(balance));
    console.log("Base ETH balance:", balanceETH.toFixed(6), "ETH");
    
    const network = await deployer.provider.getNetwork();
    console.log("Network:", network.name, "| Chain ID:", network.chainId.toString());
    
    if (network.chainId.toString() !== "8453") {
        console.error("❌ ERROR: Not on Base mainnet! Expected Chain ID: 8453");
        process.exit(1);
    }
    
    if (balanceETH < 0.01) {
        console.error("❌ ERROR: Insufficient balance for deployment");
        console.log("Required: ~0.015 ETH | Available:", balanceETH.toFixed(6), "ETH");
        process.exit(1);
    }
    
    console.log("✅ All checks passed! Deploying to Base mainnet...\n");
    
    // Get gas price
    const feeData = await deployer.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    
    const startTime = Date.now();
    
    // Deploy Enhanced NFT Contract
    console.log("🎨 Deploying Enhanced Boldly Elephunky NFT...");
    try {
        const BoldlyElephunkyNFTEnhanced = await ethers.getContractFactory("BoldlyElephunkyNFTEnhanced");
        const nftEnhanced = await BoldlyElephunkyNFTEnhanced.deploy();
        await nftEnhanced.waitForDeployment();
        const nftAddress = await nftEnhanced.getAddress();
        
        console.log("✅ Enhanced NFT deployed:", nftAddress);
        console.log("   - Genesis support: Token IDs 1-100");
        console.log("   - Regular NFTs: Token IDs 101-10000");
        console.log("   - Automatic tier detection");
        
    } catch (error) {
        console.error("❌ NFT deployment failed:", error.message);
        process.exit(1);
    }
    
    // Deploy HVNA Token Contract  
    console.log("\n💰 Deploying HVNA Token...");
    try {
        const HVNAToken = await ethers.getContractFactory("HVNAToken");
        const token = await HVNAToken.deploy();
        await token.waitForDeployment();
        const tokenAddress = await token.getAddress();
        
        console.log("✅ HVNA Token deployed:", tokenAddress);
        console.log("   - Symbol: HVNA");
        console.log("   - Decimals: 18");
        console.log("   - EUR value calculation: 1 HVNA = €0.01");
        
    } catch (error) {
        console.error("❌ Token deployment failed:", error.message);
        process.exit(1);
    }
    
    const endTime = Date.now();
    const deployTime = ((endTime - startTime) / 1000).toFixed(2);
    
    // Final verification
    console.log("\n🔍 Deployment Verification:");
    try {
        const nftName = await nftEnhanced.name();
        const tokenSymbol = await token.symbol();
        
        console.log("✅ NFT name:", nftName);
        console.log("✅ Token symbol:", tokenSymbol);
        console.log("✅ Both contracts responding");
        
    } catch (error) {
        console.log("⚠️ Verification failed:", error.message);
    }
    
    // Calculate final costs
    const finalBalance = await deployer.provider.getBalance(deployer.address);
    const finalBalanceETH = parseFloat(ethers.formatEther(finalBalance));
    const costETH = balanceETH - finalBalanceETH;
    const costUSD = costETH * 4200; // Approximate ETH price
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 BASE MAINNET DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("Enhanced NFT:", nftAddress);
    console.log("HVNA Token: ", tokenAddress);
    console.log("Network:    Base Mainnet (Chain ID: 8453)");
    console.log("Deployer:   ", deployer.address);
    console.log("Time:       ", deployTime, "seconds");
    console.log("Cost:       ", costETH.toFixed(6), "ETH (~$" + costUSD.toFixed(2) + ")");
    
    console.log("\n🔧 NEXT STEPS:");
    console.log("1. Update Shopify widget with these addresses");
    console.log("2. Change widget network to 'base'");
    console.log("3. Test production functionality");
    console.log("4. Launch Genesis NFT sales! 🚀");
    
    console.log("\n📋 Widget Configuration:");
    console.log("base: {");
    console.log(`    nft: "${nftAddress}",`);
    console.log(`    token: "${tokenAddress}",`);
    console.log("    chainId: 8453,");
    console.log("    rpcUrls: ['https://mainnet.base.org']");
    console.log("},");
    
    console.log("\n🎯 HVNA is now live on Base mainnet!");
    console.log("Genesis NFTs ready for minting at $1000-$2500");
    console.log("Automatic 30% discounts for Genesis holders");
    console.log("Production-ready Web3 integration complete! ✨");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});