const { ethers } = require("hardhat");

async function main() {
    console.log("🐘 Deploying Enhanced HVNA Ecosystem...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    
    // Deploy Enhanced NFT Contract
    console.log("\n🎨 Deploying Enhanced Boldly Elephunky NFT...");
    const BoldlyElephunkyNFTEnhanced = await ethers.getContractFactory("BoldlyElephunkyNFTEnhanced");
    const nftEnhanced = await BoldlyElephunkyNFTEnhanced.deploy();
    await nftEnhanced.waitForDeployment();
    const nftEnhancedAddress = await nftEnhanced.getAddress();
    console.log("✅ Enhanced NFT deployed to:", nftEnhancedAddress);
    
    // Deploy HVNA Token (if not already deployed)
    console.log("\n💰 Deploying HVNA Token...");
    const HVNAToken = await ethers.getContractFactory("HVNAToken");
    const token = await HVNAToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ HVNA Token deployed to:", tokenAddress);
    
    // Mint some Genesis NFTs for testing
    console.log("\n🏆 Minting test Genesis NFTs...");
    try {
        // Mint a Genesis NFT to the deployer for testing (1 ETH = $1000)
        const genesisTx = await nftEnhanced.mintGenesis(deployer.address, {
            value: ethers.parseEther("1.0")
        });
        await genesisTx.wait();
        console.log("✅ Test Genesis NFT minted to deployer");
        
        // Check Genesis status
        const isGenesis = await nftEnhanced.isGenesis(1);
        const hasGenesis = await nftEnhanced.hasGenesisNFT(deployer.address);
        const genesisCount = await nftEnhanced.genesisBalanceOf(deployer.address);
        
        console.log("Genesis verification:");
        console.log("- Token ID 1 is Genesis:", isGenesis);
        console.log("- Deployer has Genesis NFT:", hasGenesis);
        console.log("- Deployer Genesis count:", genesisCount.toString());
        
        // Check tier
        const [tier, discount] = await nftEnhanced.getTier(deployer.address);
        console.log("- Deployer tier:", tier, "with", discount.toString() + "% discount");
        
    } catch (error) {
        console.log("⚠️ Genesis minting failed (may be insufficient funds):", error.message);
    }
    
    // Mint some tokens to deployer for testing
    console.log("\n💎 Minting test HVNA tokens...");
    try {
        const mintAmount = ethers.parseEther("40000000"); // 40M tokens = €400k value
        const mintTx = await token.mint(deployer.address, mintAmount);
        await mintTx.wait();
        console.log("✅ Test tokens minted to deployer");
        
        const balance = await token.balanceOf(deployer.address);
        const balanceFormatted = ethers.formatEther(balance);
        const eurValue = parseFloat(balanceFormatted) * 0.01;
        console.log("- Token balance:", balanceFormatted, "HVNA");
        console.log("- EUR value: €" + eurValue.toLocaleString());
        
    } catch (error) {
        console.log("⚠️ Token minting failed:", error.message);
    }
    
    console.log("\n📋 Deployment Summary:");
    console.log("====================================");
    console.log("Enhanced NFT Contract:", nftEnhancedAddress);
    console.log("HVNA Token Contract:", tokenAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);
    
    console.log("\n🔧 Shopify Widget Configuration:");
    console.log("====================================");
    console.log("Update your Shopify widget with these addresses:");
    console.log(`nft: "${nftEnhancedAddress}",`);
    console.log(`token: "${tokenAddress}",`);
    
    console.log("\n✅ Enhanced deployment complete!");
    console.log("Genesis NFTs (1-100) now supported with 30% discount");
    console.log("Regular NFTs (101-10000) with tiered discounts");
    console.log("Token holders with tiered discounts based on EUR value");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});