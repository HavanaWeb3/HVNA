const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Base Network Balance...");
    
    const [deployer] = await ethers.getSigners();
    const address = deployer.address;
    
    console.log("Address:", address);
    
    try {
        // Get balance
        const balance = await deployer.provider.getBalance(address);
        const balanceETH = ethers.formatEther(balance);
        const balanceUSD = parseFloat(balanceETH) * 3200; // Approximate ETH price
        
        console.log("✅ Base ETH Balance:", balanceETH, "ETH");
        console.log("💰 Approximate USD Value: $" + balanceUSD.toFixed(2));
        
        // Check if sufficient for deployment
        const requiredETH = 0.015; // ~$40-50
        const sufficient = parseFloat(balanceETH) >= requiredETH;
        
        console.log("\n📋 Deployment Status:");
        console.log("Required for deployment:", requiredETH, "ETH (~$40-50)");
        console.log("Current balance:", balanceETH, "ETH");
        console.log("Sufficient funds:", sufficient ? "✅ YES" : "❌ NO");
        
        if (sufficient) {
            console.log("\n🚀 READY TO DEPLOY!");
            console.log("Run: npx hardhat run scripts/deployToBase.js --network base");
        } else {
            const needed = requiredETH - parseFloat(balanceETH);
            console.log("\n⏳ Need more ETH on Base:");
            console.log("Additional needed:", needed.toFixed(4), "ETH (~$" + (needed * 3200).toFixed(0) + ")");
            console.log("\n💡 How to get Base ETH:");
            console.log("1. Bridge from Ethereum: https://bridge.base.org");
            console.log("2. Buy on Coinbase and withdraw to Base");
            console.log("3. Use cross-chain bridge from other networks");
        }
        
        // Get network info
        const network = await deployer.provider.getNetwork();
        console.log("\n🌐 Network Info:");
        console.log("Network name:", network.name);
        console.log("Chain ID:", network.chainId.toString());
        console.log("Is Base mainnet:", network.chainId.toString() === "8453" ? "✅ YES" : "❌ NO");
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
        console.log("\n💡 Make sure you have Base network configured in hardhat.config.js");
        console.log("💡 And that you have Base RPC endpoint working");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});