const { ethers } = require("ethers");

async function main() {
    // Correct wallet address that corresponds to the private key
    const walletAddress = "0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66";
    
    // Connect to Base network
    const provider = new ethers.JsonRpcProvider("https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b");
    
    console.log("Checking wallet address:", walletAddress);
    
    const balance = await provider.getBalance(walletAddress);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Balance in Wei:", balance.toString());
    
    // Check if we have enough for deployment (estimate ~0.02 ETH needed)
    const needed = ethers.parseEther("0.02");
    console.log("Sufficient funds:", balance >= needed ? "✅ YES - Ready to deploy!" : "❌ NO - Need to fund wallet");
    
    if (balance < needed) {
        const shortfall = needed - balance;
        console.log("Need to add:", ethers.formatEther(shortfall), "ETH");
        console.log("Send ETH to:", walletAddress, "on Base network");
    } else {
        console.log("🚀 Ready to deploy contracts!");
    }
}

main().catch(console.error);