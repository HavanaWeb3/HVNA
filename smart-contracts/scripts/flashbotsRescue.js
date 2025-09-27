const { ethers } = require("hardhat");

async function main() {
  console.log("=== MEV-PROTECTED NFT RESCUE ===");
  
  // Configuration
  const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  const safeWallet = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
  const genesisContract = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  
  // All potential Genesis NFT IDs (1-100)
  const allTokenIds = Array.from({length: 100}, (_, i) => i + 1);
  
  // Get deployer (your new secure wallet)
  const [deployer] = await ethers.getSigners();
  console.log("Operating from secure wallet:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Secure wallet balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.02")) {
    console.log("❌ Need at least 0.02 ETH for rescue operation");
    return;
  }
  
  // Step 1: Deploy rescue contract if needed
  console.log("\n🚀 Deploying MEV-Protected Rescue Contract...");
  
  const MEVProtectedRescuer = await ethers.getContractFactory("MEVProtectedRescuer");
  const rescuer = await MEVProtectedRescuer.deploy();
  await rescuer.waitForDeployment();
  
  const rescuerAddress = await rescuer.getAddress();
  console.log("✅ Rescue contract deployed:", rescuerAddress);
  
  // Step 2: Check which NFTs are actually owned
  console.log("\n🔍 Checking NFT ownership...");
  
  const [ownedTokens, ownedCount] = await rescuer.checkOwnedNFTs(
    genesisContract,
    compromisedWallet,
    allTokenIds
  );
  
  console.log(`Found ${ownedCount} NFTs in compromised wallet:`);
  console.log("Token IDs:", ownedTokens.map(id => id.toString()).join(", "));
  
  if (ownedCount === 0) {
    console.log("❌ No NFTs found to rescue");
    return;
  }
  
  // Step 3: Estimate gas costs
  const gasPrice = await ethers.provider.getFeeData();
  const currentGasPrice = gasPrice.gasPrice;
  
  console.log("\n💰 Cost Estimation:");
  console.log("Current gas price:", ethers.formatUnits(currentGasPrice, "gwei"), "gwei");
  
  const [totalCost, gasPerNFT] = await rescuer.estimateRescueCost(
    ownedCount,
    currentGasPrice
  );
  
  console.log("Gas per NFT:", gasPerNFT.toString());
  console.log("Total rescue cost:", ethers.formatEther(totalCost), "ETH");
  console.log("USD cost (approx):", "$" + (parseFloat(ethers.formatEther(totalCost)) * 3500).toFixed(2));
  
  // Step 4: Prepare rescue transaction
  console.log("\n🛡️ Preparing MEV-Protected Rescue...");
  
  // Add 20% buffer to gas cost
  const gasBuffer = totalCost * 120n / 100n;
  
  console.log("With 20% buffer:", ethers.formatEther(gasBuffer), "ETH");
  
  if (balance < gasBuffer) {
    console.log("❌ Insufficient balance for rescue");
    console.log("Required:", ethers.formatEther(gasBuffer), "ETH");
    console.log("Available:", ethers.formatEther(balance), "ETH");
    return;
  }
  
  // Step 5: Execute rescue
  console.log("\n🚀 Executing rescue operation...");
  console.log("⚠️  This will send ETH to compromised wallet and immediately transfer NFTs");
  console.log("📡 Using MEV protection to avoid public mempool");
  
  try {
    // Prepare transaction with MEV protection
    const rescueTx = await rescuer.executeRescue(
      genesisContract,
      compromisedWallet,
      safeWallet,
      ownedTokens,
      gasPerNFT,
      {
        value: gasBuffer,
        gasLimit: 10000000, // High gas limit for bulk transfers
        maxFeePerGas: currentGasPrice * 2n, // Willing to pay premium for speed
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei") // MEV tip
      }
    );
    
    console.log("📤 Transaction submitted:", rescueTx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await rescueTx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ RESCUE SUCCESSFUL!");
      console.log("🎉 All NFTs should now be in your secure wallet:", safeWallet);
      console.log("🔗 Transaction:", `https://basescan.org/tx/${rescueTx.hash}`);
      
      // Parse events to show results
      const events = receipt.logs;
      console.log("\n📊 Rescue Results:");
      events.forEach(event => {
        try {
          const parsed = rescuer.interface.parseLog(event);
          if (parsed.name === "NFTRescueCompleted") {
            console.log(`✅ Successfully rescued: ${parsed.args.successCount} NFTs`);
            console.log(`❌ Failed transfers: ${parsed.args.failedCount} NFTs`);
          }
        } catch (e) {
          // Ignore unparseable events
        }
      });
      
    } else {
      console.log("❌ Transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Rescue failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Try increasing your ETH balance");
    } else if (error.message.includes("gas")) {
      console.log("💡 Try adjusting gas parameters");
    }
  }
  
  console.log("\n🔍 Next Steps:");
  console.log("1. Check your new wallet for the rescued NFTs");
  console.log("2. Update your website to use the new secure wallet");
  console.log("3. Re-enable NFT sales with proper security");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });