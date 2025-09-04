const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking wallet holdings on Sepolia...");
    
    const walletAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5";
    
    // Contract addresses (NEW)
    const NFT_ADDRESS = "0xA292b4c3355dF1478Ef6Bad115008B211fEB838d";
    const TOKEN_ADDRESS = "0x6351b9A1c1DD1F61187769D34Ce5Ea098B0B03d4";
    
    try {
        // Check NFT balance
        const nftABI = ["function balanceOf(address owner) external view returns (uint256)"];
        const nftContract = await ethers.getContractAt(nftABI, NFT_ADDRESS);
        const nftBalance = await nftContract.balanceOf(walletAddress);
        console.log(`NFT Balance: ${nftBalance.toString()}`);
        
        // Check token balance
        const tokenABI = [
            "function balanceOf(address account) external view returns (uint256)",
            "function decimals() external view returns (uint8)"
        ];
        const tokenContract = await ethers.getContractAt(tokenABI, TOKEN_ADDRESS);
        const tokenBalance = await tokenContract.balanceOf(walletAddress);
        const decimals = await tokenContract.decimals();
        const tokenAmount = ethers.formatUnits(tokenBalance, decimals);
        console.log(`Token Balance: ${tokenAmount} HVNA`);
        
        // Calculate EUR value
        const tokenValueEUR = parseFloat(tokenAmount) * 0.01;
        console.log(`Token Value: €${tokenValueEUR.toFixed(2)}`);
        
    } catch (error) {
        console.error("Error checking balances:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});