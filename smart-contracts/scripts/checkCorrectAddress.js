const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Your CORRECT Bridge Address on Base...");
    
    // The actual address that sent the bridge transaction
    const bridgeFromAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    
    // Create a provider for Base network
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    console.log("Checking address:", bridgeFromAddress);
    console.log("This is where your bridged ETH should arrive on Base\n");
    
    try {
        // Get balance
        const balance = await provider.getBalance(bridgeFromAddress);
        const balanceETH = ethers.formatEther(balance);
        const balanceUSD = parseFloat(balanceETH) * 4200;
        
        console.log("💰 Balance Results:");
        console.log("ETH Balance:", balanceETH, "ETH");
        console.log("USD Value: ~$" + balanceUSD.toFixed(2));
        
        // Check if sufficient for deployment
        const requiredETH = 0.015;
        const sufficient = parseFloat(balanceETH) >= requiredETH;
        const hasETH = parseFloat(balanceETH) > 0;
        
        console.log("\n📋 Status:");
        console.log("Expected from bridge: ~0.006 ETH");
        console.log("Currently available:", balanceETH, "ETH");
        
        if (sufficient) {
            console.log("🚀 READY TO DEPLOY!");
            console.log("You have enough ETH for contract deployment!");
        } else if (hasETH) {
            console.log("✅ ETH HAS ARRIVED!");
            console.log("⚠️ But need more for deployment (need ~0.015 ETH total)");
            console.log("💡 You may need to bridge a bit more");
        } else {
            console.log("⏳ ETH still arriving...");
            console.log("Bridge can take 15-20 minutes total");
        }
        
        // Check other addresses for comparison
        console.log("\n🔍 Comparison with other addresses:");
        
        const otherAddresses = [
            "0xb8b458464f74F0F8b2B3e6427c0aD48FBdCF0F22", // Your Base wallet
            "0x4844382d686CE775e095315C084d40cEd16d8Cf5"  // Deployment address
        ];
        
        for (const addr of otherAddresses) {
            const bal = await provider.getBalance(addr);
            const balETH = ethers.formatEther(bal);
            console.log(`${addr}: ${balETH} ETH`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});