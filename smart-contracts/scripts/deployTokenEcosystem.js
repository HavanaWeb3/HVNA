const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying HVNA Token Pre-Sale Ecosystem...\n");
  
  // Create deployer wallet directly from private key
  const provider = new hre.ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const deployer = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log("Deploying with account:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Configuration
  const genesisNFTAddress = process.env.GENESIS_NFT_ADDRESS;
  const ethUsdPriceFeed = process.env.ETH_USD_PRICE_FEED;
  const launchDate = 1759276800; // October 1, 2025
  
  console.log("Genesis NFT Address:", genesisNFTAddress);
  console.log("Launch Date:", new Date(launchDate * 1000).toLocaleDateString());
  console.log("=" .repeat(60));

  // 1. Deploy HVNA Token
  console.log("1️⃣ Deploying HVNA Token...");
  const HVNAToken = await hre.ethers.getContractFactory("HVNAToken", deployer);
  const hvnaToken = await HVNAToken.deploy(); // No constructor parameters
  await hvnaToken.waitForDeployment();
  const hvnaAddress = await hvnaToken.getAddress();
  console.log("✅ HVNA Token deployed:", hvnaAddress);

  // 2. Deploy TokenPreSaleBase
  console.log("2️⃣ Deploying Token Pre-Sale Contract...");
  const TokenPreSale = await hre.ethers.getContractFactory("TokenPreSaleBase", deployer);
  
  // Calculate phase dates
  const genesisPhaseStart = launchDate;
  const genesisPhaseEnd = launchDate + (7 * 24 * 60 * 60); // 7 days later
  const publicPhaseStart = genesisPhaseEnd;
  const publicPhaseEnd = publicPhaseStart + (30 * 24 * 60 * 60); // 30 days later
  
  const tokenPreSale = await TokenPreSale.deploy(
    hvnaAddress,                    // HVNA token
    genesisNFTAddress,              // Existing Genesis NFT
    ethUsdPriceFeed,                // Chainlink price feed
    genesisPhaseStart,              // Genesis phase start
    genesisPhaseEnd,                // Genesis phase end
    publicPhaseStart,               // Public phase start  
    publicPhaseEnd                  // Public phase end
  );
  await tokenPreSale.waitForDeployment();
  const presaleAddress = await tokenPreSale.getAddress();
  console.log("✅ Token Pre-Sale deployed:", presaleAddress);

  // 3. Deploy DiscountManager
  console.log("3️⃣ Deploying Discount Manager...");
  const DiscountManager = await hre.ethers.getContractFactory("DiscountManager", deployer);
  const discountManager = await DiscountManager.deploy(
    hvnaAddress,        // HVNA token
    genesisNFTAddress   // Genesis NFT
  );
  await discountManager.waitForDeployment();
  const discountAddress = await discountManager.getAddress();
  console.log("✅ Discount Manager deployed:", discountAddress);

  console.log("\n4️⃣ Funding Pre-Sale Contract...");
  // Transfer 15M tokens to pre-sale contract
  const presaleAmount = hre.ethers.parseEther("15000000"); // 15M tokens
  console.log("Transferring 15M HVNA to pre-sale contract...");
  await hvnaToken.transfer(presaleAddress, presaleAmount);
  console.log("✅ Pre-sale funded with 15M HVNA tokens");

  console.log("\n🎉 DEPLOYMENT COMPLETE! 🎉");
  console.log("=" .repeat(60));
  console.log("📋 CONTRACT ADDRESSES:");
  console.log("=" .repeat(60));
  console.log(`HVNA Token:        ${hvnaAddress}`);
  console.log(`Token Pre-Sale:    ${presaleAddress}`);
  console.log(`Discount Manager:  ${discountAddress}`);
  console.log(`Genesis NFT:       ${genesisNFTAddress} (existing)`);
  console.log("=" .repeat(60));
  
  console.log("\n💰 PRE-SALE CONFIGURATION:");
  console.log("- Token Price: $0.01 USD (paid in ETH)");
  console.log("- Total Pre-Sale: 15M HVNA tokens");
  console.log("- Genesis Phase: 5M tokens (7 days)");
  console.log("- Public Phase: 10M tokens (30 days)");
  console.log("- Launch Date: October 1, 2025");
  
  console.log("\n🎯 DISCOUNT SYSTEM:");
  console.log("- Genesis NFT Holders: 30% lifetime discount");
  console.log("- Token Tier 1 ($150+): 10% discount");
  console.log("- Token Tier 2 ($250+): 20% discount");
  console.log("- Token Tier 3 ($500+): 30% discount");
  console.log("- Genesis + $150+ Tokens: 40% maximum discount");
  
  console.log("\n🔗 INTEGRATION READY:");
  console.log("- Shopify API endpoint needed");
  console.log("- Web3 wallet connection ready");
  console.log("- Real-time discount calculation available");
  
  // Save deployment info
  const deploymentInfo = {
    network: "Base Mainnet",
    chainId: 8453,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    contracts: {
      hvnaToken: hvnaAddress,
      tokenPreSale: presaleAddress,
      discountManager: discountAddress,
      genesisNFT: genesisNFTAddress
    },
    configuration: {
      launchDate: launchDate,
      presaleTokens: "15000000",
      genesisPhaseLimit: "5000000",
      tokenPrice: "$0.01 USD"
    }
  };

  console.log("\n📄 Deployment info saved to deployment-base.json");
  require("fs").writeFileSync(
    "deployment-base.json", 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("=" .repeat(60));
  console.log("🎊 READY FOR OCTOBER 1ST LAUNCH! 🎊");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });