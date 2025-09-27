const { ethers } = require("hardhat");

async function main() {
  console.log("=== SIMPLE NFT RESCUE ===");
  
  // Configuration
  const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  const safeWallet = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
  const genesisContract = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  
  const [deployer] = await ethers.getSigners();
  console.log("Operating from:", deployer.address);
  
  // Deploy simple rescuer
  console.log("🚀 Deploying Simple Rescue Contract...");
  const SimpleNFTRescuer = await ethers.getContractFactory("SimpleNFTRescuer");
  const rescuer = await SimpleNFTRescuer.deploy();
  await rescuer.waitForDeployment();
  
  const rescuerAddress = await rescuer.getAddress();
  console.log("✅ Simple rescue contract deployed:", rescuerAddress);
  
  // Token IDs to rescue
  const tokenIds = [
    3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100
  ];
  
  // Calculate gas needed for transfers
  const gasPerTransfer = BigInt(100000); // Conservative estimate
  const gasPrice = await ethers.provider.getFeeData();
  const currentGasPrice = gasPrice.gasPrice;
  const totalGasNeeded = BigInt(tokenIds.length) * gasPerTransfer * currentGasPrice;
  
  console.log(`📊 Rescue plan:`);
  console.log(`- NFTs to rescue: ${tokenIds.length}`);
  console.log(`- Gas per transfer: ${gasPerTransfer.toString()}`);
  console.log(`- Total gas needed: ${ethers.formatEther(totalGasNeeded)} ETH`);
  
  try {
    console.log("🚀 Executing simple rescue...");
    console.log("⚠️  This will send ETH to compromised wallet for gas");
    
    const tx = await rescuer.rescueNFTs(
      genesisContract,
      compromisedWallet,
      safeWallet,
      tokenIds,
      {
        value: totalGasNeeded,
        gasLimit: BigInt(8000000) // High gas limit
      }
    );
    
    console.log("📤 Transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ RESCUE OPERATION COMPLETED!");
      console.log("🎉 Check your secure wallet for the rescued NFTs");
      console.log("🔗 Transaction:", `https://basescan.org/tx/${tx.hash}`);
      
      // Parse events
      const events = receipt.logs;
      for (const log of events) {
        try {
          const parsed = rescuer.interface.parseLog(log);
          if (parsed.name === "NFTsRescued") {
            console.log(`✅ Successfully rescued: ${parsed.args.count} NFTs`);
          }
        } catch (e) {
          // Ignore unparseable events
        }
      }
    } else {
      console.log("❌ Transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Rescue failed:", error.message);
    console.log("💡 This approach requires the compromised wallet to cooperate");
    console.log("💡 The malicious actor may be blocking our rescue attempts");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });