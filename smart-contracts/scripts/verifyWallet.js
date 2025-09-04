const { ethers } = require("hardhat");

async function main() {
    // Get the wallet from private key in .env
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    console.log("Using private key from .env");
    
    const wallet = new ethers.Wallet(privateKey);
    console.log("Wallet address from private key:", wallet.address);
    
    // Connect to Base provider and check balance
    const [deployer] = await ethers.getSigners();
    console.log("Hardhat signer address:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);