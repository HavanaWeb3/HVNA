const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Your Actual Base Address...");
    
    // Your actual Base wallet address
    const yourAddress = "0xb8b458464f74F0F8b2B3e6427c0aD48FBdCF0F22";
    // The deployment address from config
    const deployAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5";
    
    // Create a provider for Base network
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    console.log("Checking both addresses on Base network:\n");
    
    // Check your actual address
    try {
        const balance1 = await provider.getBalance(yourAddress);
        const balanceETH1 = ethers.formatEther(balance1);
        const balanceUSD1 = parseFloat(balanceETH1) * 4200;
        
        console.log("📱 Your Base Address:", yourAddress);
        console.log("   ETH Balance:", balanceETH1, "ETH");
        console.log("   USD Value: ~$" + balanceUSD1.toFixed(2));
        console.log("   Status:", parseFloat(balanceETH1) > 0 ? "✅ HAS ETH!" : "❌ No ETH");
        
    } catch (error) {
        console.error("❌ Error checking your address:", error.message);
    }
    
    console.log();
    
    // Check the deployment address  
    try {
        const balance2 = await provider.getBalance(deployAddress);
        const balanceETH2 = ethers.formatEther(balance2);
        const balanceUSD2 = parseFloat(balanceETH2) * 4200;
        
        console.log("🔧 Deployment Address:", deployAddress);
        console.log("   ETH Balance:", balanceETH2, "ETH");
        console.log("   USD Value: ~$" + balanceUSD2.toFixed(2));
        console.log("   Status:", parseFloat(balanceETH2) > 0 ? "✅ HAS ETH!" : "❌ No ETH");
        
    } catch (error) {
        console.error("❌ Error checking deployment address:", error.message);
    }
    
    console.log("\n🎯 FINDINGS:");
    console.log("================");
    
    const yourBalance = await provider.getBalance(yourAddress);
    const deployBalance = await provider.getBalance(deployAddress);
    const yourETH = parseFloat(ethers.formatEther(yourBalance));
    const deployETH = parseFloat(ethers.formatEther(deployBalance));
    
    if (yourETH > 0.01) {
        console.log("✅ Found ETH in YOUR address!");
        console.log("💡 We need to transfer some to the deployment address");
        console.log("   or update the deployment to use your address");
    } else if (deployETH > 0.01) {
        console.log("✅ Found ETH in DEPLOYMENT address!");
        console.log("💡 Ready to deploy with existing setup");
    } else {
        console.log("⏳ No ETH found in either address yet");
        console.log("💡 Bridge may still be processing...");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});