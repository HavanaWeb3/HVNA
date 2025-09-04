require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    console.log("Environment check:");
    console.log("- DEPLOYER_PRIVATE_KEY set:", !!process.env.DEPLOYER_PRIVATE_KEY);
    console.log("- BASE_RPC_URL:", process.env.BASE_RPC_URL);
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log("\nHardhat signer:");
        console.log("- Address:", deployer.address);
        
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("- Balance:", ethers.formatEther(balance), "ETH");
        
        // Direct wallet test
        const directWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
        console.log("\nDirect wallet from private key:");
        console.log("- Address:", directWallet.address);
        
        console.log("\nMatch:", deployer.address === directWallet.address ? "✅" : "❌");
    } catch (error) {
        console.error("Signer error:", error.message);
        
        // Try direct wallet
        const directWallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
        console.log("\nDirect wallet from private key:");
        console.log("- Address:", directWallet.address);
    }
}

main().catch(console.error);