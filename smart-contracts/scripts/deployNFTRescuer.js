const { ethers } = require("hardhat");

async function main() {
  console.log("=== DEPLOYING NFT RESCUE CONTRACT ===");
  
  // Get the deployer (should be your new secure wallet)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("❌ Insufficient balance for deployment");
    return;
  }
  
  // Deploy the Simple NFT Rescuer contract
  console.log("🚀 Deploying SimpleNFTRescuer contract...");
  
  const SimpleNFTRescuer = await ethers.getContractFactory("SimpleNFTRescuer");
  
  const rescuer = await SimpleNFTRescuer.deploy();
  await rescuer.waitForDeployment();
  
  const rescuerAddress = await rescuer.getAddress();
  console.log("✅ NFTRescuer deployed to:", rescuerAddress);
  
  // Prepare NFT rescue data
  const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  const safeWallet = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
  const genesisContract = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  
  // All potential Genesis NFT IDs (1-100)
  const potentialNFTIds = Array.from({length: 100}, (_, i) => i + 1);
  
  console.log(`\n📋 RESCUE PLAN:`);
  console.log(`From: ${compromisedWallet}`);
  console.log(`To: ${safeWallet}`);
  console.log(`NFT Contract: ${genesisContract}`);
  console.log(`Potential NFTs: ${potentialNFTIds.length} (IDs 1-100)`);
  
  console.log(`\n🎯 Next Steps:`);
  console.log(`1. Fund your new wallet (${safeWallet}) with ~0.1 ETH for gas`);
  console.log(`2. Run the rescue script: npx hardhat run scripts/executeNFTRescue.js --network base`);
  console.log(`\n⚠️  Make sure your compromised wallet has approval for the rescue contract!`);
  
  return {
    rescuerAddress,
    compromisedWallet,
    safeWallet,
    genesisContract,
    potentialNFTIds
  };
}

main()
  .then((result) => {
    if (result) {
      console.log("\n✅ Deployment successful!");
      console.log("Rescuer contract:", result.rescuerAddress);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });