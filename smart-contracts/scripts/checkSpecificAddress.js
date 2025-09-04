const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Specific Address on Base...");
    
    // The address that initiated the bridge (from your Ethereum mainnet)
    const bridgeAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5";
    
    // Create a provider for Base network
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    console.log("Checking address:", bridgeAddress);
    console.log("Network: Base Mainnet");
    
    try {
        // Get balance
        const balance = await provider.getBalance(bridgeAddress);
        const balanceETH = ethers.formatEther(balance);
        const balanceUSD = parseFloat(balanceETH) * 4200; // Approximate ETH price
        
        console.log("\n💰 Balance Results:");
        console.log("ETH Balance:", balanceETH, "ETH");
        console.log("USD Value: ~$" + balanceUSD.toFixed(2));
        
        // Check if sufficient for deployment
        const requiredETH = 0.015;
        const sufficient = parseFloat(balanceETH) >= requiredETH;
        
        console.log("\n📋 Deployment Status:");
        console.log("Required:", requiredETH, "ETH");
        console.log("Available:", balanceETH, "ETH");
        console.log("Sufficient:", sufficient ? "✅ YES - READY TO DEPLOY!" : "❌ NO");
        
        if (sufficient) {
            console.log("\n🚀 READY FOR DEPLOYMENT!");
            console.log("Your bridged ETH has arrived successfully!");
            console.log("We can deploy the contracts immediately!");
        } else if (parseFloat(balanceETH) > 0) {
            console.log("\n⏳ ETH is there but still arriving...");
            console.log("Bridge may still be processing the full amount.");
            console.log("Expected: ~0.006 ETH from bridge");
        } else {
            console.log("\n⏳ ETH still in transit...");
            console.log("Bridge confirmed but ETH not yet arrived on Base.");
            console.log("This can take up to 15-20 minutes.");
        }
        
        // Network verification
        const network = await provider.getNetwork();
        console.log("\n🌐 Network Info:");
        console.log("Chain ID:", network.chainId.toString());
        console.log("Is Base:", network.chainId.toString() === "8453" ? "✅ YES" : "❌ NO");
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});