const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    
    console.log("Deployment wallet address:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Balance in Wei:", balance.toString());
    
    // Check if we have enough for deployment (estimate ~0.02 ETH needed)
    const needed = ethers.parseEther("0.02");
    console.log("Sufficient funds:", balance >= needed ? "✅ YES" : "❌ NO - Need to fund wallet");
    
    if (balance < needed) {
        const shortfall = needed - balance;
        console.log("Need to add:", ethers.formatEther(shortfall), "ETH");
    }
}

main().catch(console.error);