const { ethers } = require("hardhat");

async function main() {
  console.log("=== EXECUTING NFT RESCUE ===");
  
  // Configuration
  const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  const safeWallet = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
  const genesisContract = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  const rescuerAddress = "0x770008bd750c230000D7f581a454c8eE437ab7F8";
  
  // Connect to deployed rescue contract
  const [deployer] = await ethers.getSigners();
  console.log("Operating from:", deployer.address);
  
  const rescuer = await ethers.getContractAt("MEVProtectedRescuer", rescuerAddress);
  
  // Token IDs we know exist (from previous check)
  const tokenIds = [
    3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100
  ];
  
  console.log(`Rescuing ${tokenIds.length} NFTs...`);
  
  // Gas estimation
  const gasPrice = await ethers.provider.getFeeData();
  const currentGasPrice = gasPrice.gasPrice;
  const gasPerNFT = BigInt(120000);
  const totalGas = BigInt(tokenIds.length) * gasPerNFT;
  const totalCost = totalGas * currentGasPrice;
  const gasBuffer = totalCost * BigInt(120) / BigInt(100); // 20% buffer
  
  console.log("Gas cost estimate:", ethers.formatEther(gasBuffer), "ETH");
  
  try {
    const tx = await rescuer.executeRescue(
      genesisContract,
      compromisedWallet,
      safeWallet,
      tokenIds,
      gasPerNFT,
      {
        value: gasBuffer,
        gasLimit: BigInt(10000000),
        gasPrice: currentGasPrice
      }
    );
    
    console.log("🚀 Transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ RESCUE SUCCESSFUL!");
      console.log("🎉 All NFTs should now be in your secure wallet:", safeWallet);
      console.log("🔗 Transaction:", `https://basescan.org/tx/${tx.hash}`);
    } else {
      console.log("❌ Transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Rescue failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });