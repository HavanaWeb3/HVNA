const { ethers } = require("hardhat");

async function main() {
  console.log("=== DEPLOYING SECURE TOKEN SALE CONTRACT ===");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from secure wallet:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("❌ Need at least 0.01 ETH for deployment");
    return;
  }
  
  // Contract addresses
  const hvnaTokenAddress = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
  const genesisNFTAddress = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  
  console.log("🚀 Deploying TokenPreSaleFixed contract...");
  console.log("HVNA Token:", hvnaTokenAddress);
  console.log("Genesis NFT:", genesisNFTAddress);
  
  // Set up phase timing (all phases active immediately)
  const now = Math.floor(Date.now() / 1000);
  const genesisPhaseStart = now;
  const genesisPhaseEnd = now + (30 * 24 * 60 * 60); // 30 days
  const publicPhaseStart = now;
  const publicPhaseEnd = now + (90 * 24 * 60 * 60); // 90 days
  
  console.log("Phase timing:");
  console.log("Genesis phase:", new Date(genesisPhaseStart * 1000).toLocaleString(), "to", new Date(genesisPhaseEnd * 1000).toLocaleString());
  console.log("Public phase:", new Date(publicPhaseStart * 1000).toLocaleString(), "to", new Date(publicPhaseEnd * 1000).toLocaleString());
  
  try {
    // Deploy the contract
    const TokenPreSaleFixed = await ethers.getContractFactory("TokenPreSaleFixed");
    const tokenSale = await TokenPreSaleFixed.deploy(
      hvnaTokenAddress,
      genesisNFTAddress,
      genesisPhaseStart,
      genesisPhaseEnd,
      publicPhaseStart,
      publicPhaseEnd
    );
    
    await tokenSale.waitForDeployment();
    const contractAddress = await tokenSale.getAddress();
    
    console.log("✅ TokenPreSaleFixed deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("👤 Owner:", deployer.address);
    
    // Verify deployment
    const owner = await tokenSale.owner();
    const hvnaToken = await tokenSale.hvnaToken();
    const genesisNFT = await tokenSale.genesisNFT();
    
    console.log("\n🔍 Deployment Verification:");
    console.log("✅ Owner set correctly:", owner === deployer.address);
    console.log("✅ HVNA Token connected:", hvnaToken === hvnaTokenAddress);
    console.log("✅ Genesis NFT connected:", genesisNFT === genesisNFTAddress);
    
    // Check sale status
    const saleActive = await tokenSale.saleActive();
    const currentPhase = await tokenSale.currentPhase();
    console.log("✅ Sale active:", saleActive);
    console.log("✅ Current phase:", currentPhase); // 0=GENESIS, 1=PUBLIC, 2=ENDED
    
    // Save deployment info
    const deploymentInfo = {
      network: "base",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        tokenPreSaleSecure: contractAddress,
        hvnaToken: hvnaTokenAddress,
        genesisNFT: genesisNFTAddress
      }
    };
    
    console.log("\n📋 Update your website with this contract address:");
    console.log(`PRESALE_CONTRACT = "${contractAddress}"`);
    
    console.log("\n🔗 View on BaseScan:");
    console.log(`https://basescan.org/address/${contractAddress}`);
    
    console.log("\n✅ SECURE DEPLOYMENT COMPLETE!");
    console.log("🔒 Contract owned by your secure Rabby wallet");
    console.log("💰 Ready to receive customer payments safely");
    
    return deploymentInfo;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then((result) => {
    if (result) {
      console.log("\n🎉 Ready to update website and resume token sales!");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });