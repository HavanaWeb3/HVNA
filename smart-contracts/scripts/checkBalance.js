const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    
    console.log("Deployment wallet:", deployer.address);
    console.log("Current balance:", ethers.formatEther(balance), "ETH");
    console.log("Balance in Wei:", balance.toString());
    
    // Estimate gas for each contract
    const hvnaFactory = await ethers.getContractFactory("HVNAToken");
    const gasEstimate1 = await hvnaFactory.getDeployTransaction(
        "Havana Token",
        "HVNA",
        ethers.parseEther("100000000")
    ).then(tx => tx.gasLimit || 2000000n);
    
    console.log("Estimated gas for HVNA Token:", gasEstimate1.toString());
    
    const gasPrice = await deployer.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
    
    const totalCost = gasEstimate1 * (gasPrice.gasPrice || 1000000000n) * 3n; // 3 contracts
    console.log("Estimated total cost:", ethers.formatEther(totalCost), "ETH");
    console.log("Sufficient funds:", balance > totalCost ? "✅ YES" : "❌ NO");
}

main().catch(console.error);