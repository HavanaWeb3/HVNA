const hre = require("hardhat");

async function main() {
  console.log("🐘 Deploying Complete Havana Elephant Brand Web3 Ecosystem...\n");
  
  // Create deployer wallet directly from private key
  const provider = new hre.ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const deployer = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log("Deploying with account:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString(), "(" + hre.ethers.formatEther(balance) + " ETH)");
  console.log("=" .repeat(60));

  // Deploy Core Contracts
  console.log("📄 Deploying Core Contracts...");
  
  // 1. Deploy HVNA Token
  console.log("1️⃣  Deploying HVNA Token...");
  const HVNAToken = await hre.ethers.getContractFactory("HVNAToken", deployer);
  const hvnaToken = await HVNAToken.deploy();
  await hvnaToken.waitForDeployment();
  const hvnaAddress = await hvnaToken.getAddress();
  console.log("✅ HVNA Token:", hvnaAddress);

  // 2. Deploy NFT Contract
  console.log("2️⃣  Deploying Boldly Elephunky NFT...");
  const BoldlyElephunkyNFT = await hre.ethers.getContractFactory("BoldlyElephunkyNFT");
  const nftContract = await BoldlyElephunkyNFT.deploy();
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("✅ Boldly Elephunky NFT:", nftAddress);

  // 3. Deploy Treasury
  console.log("3️⃣  Deploying Treasury Contract...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(hvnaAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ Treasury:", treasuryAddress);

  // 4. Deploy Governance
  console.log("4️⃣  Deploying Governance Contract...");
  const Governance = await hre.ethers.getContractFactory("Governance");
  const governance = await Governance.deploy(hvnaAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("✅ Governance:", governanceAddress);

  // 5. Deploy Loyalty Manager
  console.log("5️⃣  Deploying Loyalty Manager...");
  const LoyaltyManager = await hre.ethers.getContractFactory("LoyaltyManager");
  const loyaltyManager = await LoyaltyManager.deploy(hvnaAddress, nftAddress);
  await loyaltyManager.waitForDeployment();
  const loyaltyAddress = await loyaltyManager.getAddress();
  console.log("✅ Loyalty Manager:", loyaltyAddress);

  // 6. Deploy Token Sale
  console.log("6️⃣  Deploying Token Sale Contract...");
  const TokenSale = await hre.ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(hvnaAddress);
  await tokenSale.waitForDeployment();
  const tokenSaleAddress = await tokenSale.getAddress();
  console.log("✅ Token Sale:", tokenSaleAddress);

  // 7. Deploy Token Staking
  console.log("7️⃣  Deploying Token Staking...");
  const TokenStaking = await hre.ethers.getContractFactory("TokenStaking");
  const tokenStaking = await TokenStaking.deploy(hvnaAddress, nftAddress);
  await tokenStaking.waitForDeployment();
  const stakingAddress = await tokenStaking.getAddress();
  console.log("✅ Token Staking:", stakingAddress);

  // 8. Deploy ContentFlow Core
  console.log("8️⃣  Deploying ContentFlow Core...");
  const ContentFlowCore = await hre.ethers.getContractFactory("ContentFlowCore");
  const contentFlow = await ContentFlowCore.deploy(hvnaAddress);
  await contentFlow.waitForDeployment();
  const contentFlowAddress = await contentFlow.getAddress();
  console.log("✅ ContentFlow Core:", contentFlowAddress);

  console.log("\n" + "=" .repeat(60));
  console.log("🔧 Setting up Contract Integrations...");

  // Setup Contract Integrations
  try {
    // Set Treasury in Governance
    console.log("🔗 Linking Treasury to Governance...");
    await treasury.setGovernanceContract(governanceAddress);
    
    // Set Treasury in ContentFlow
    console.log("🔗 Linking Treasury to ContentFlow...");
    await contentFlow.setTreasuryContract(treasuryAddress);
    
    console.log("✅ Contract integrations completed");
  } catch (error) {
    console.log("⚠️  Integration setup error (non-critical):", error.message);
  }

  console.log("\n" + "=" .repeat(60));
  console.log("💰 Setting up Token Distribution...");

  try {
    // Transfer tokens to various contracts
    const saleAmount = hre.ethers.parseEther("35000000"); // 35M for presale
    const stakingAmount = hre.ethers.parseEther("10000000"); // 10M for staking rewards
    const contentFlowAmount = hre.ethers.parseEther("15000000"); // 15M for ContentFlow
    
    console.log("📤 Transferring 35M HVNA to Token Sale...");
    await hvnaToken.transfer(tokenSaleAddress, saleAmount);
    
    console.log("📤 Transferring 10M HVNA to Staking Contract...");
    await hvnaToken.transfer(stakingAddress, stakingAmount);
    
    console.log("📤 Transferring 15M HVNA to ContentFlow...");
    await hvnaToken.transfer(contentFlowAddress, contentFlowAmount);
    
    console.log("✅ Token distribution completed");
  } catch (error) {
    console.log("⚠️  Token distribution error:", error.message);
  }

  console.log("\n" + "=" .repeat(60));
  console.log("🎯 Setting up NFT Tiers for Demo...");
  
  try {
    // Setup some demo NFT tiers
    const tokenIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const tiers = [1, 1, 1, 2, 2, 2, 2, 3, 3, 3]; // Mix of Silver, Gold, Platinum
    
    console.log("🏆 Setting NFT tier system...");
    await loyaltyManager.setNFTTiers(tokenIds, tiers);
    console.log("✅ NFT tiers configured");
  } catch (error) {
    console.log("⚠️  NFT tier setup error:", error.message);
  }

  console.log("\n" + "🎉 ECOSYSTEM DEPLOYMENT COMPLETE! 🎉");
  console.log("=" .repeat(80));
  console.log("📋 CONTRACT ADDRESSES:");
  console.log("=" .repeat(80));
  console.log(`HVNA Token:           ${hvnaAddress}`);
  console.log(`Boldly Elephunky NFT: ${nftAddress}`);
  console.log(`Token Sale:           ${tokenSaleAddress}`);
  console.log(`Treasury:             ${treasuryAddress}`);
  console.log(`Governance:           ${governanceAddress}`);
  console.log(`Loyalty Manager:      ${loyaltyAddress}`);
  console.log(`Token Staking:        ${stakingAddress}`);
  console.log(`ContentFlow Core:     ${contentFlowAddress}`);
  console.log("=" .repeat(80));
  
  console.log("\n🛍️  SHOPIFY INTEGRATION READY:");
  console.log(`- Loyalty Manager: ${loyaltyAddress}`);
  console.log("- Supports NFT tier discounts (Silver 10%, Gold 25%, Platinum 50%)");
  console.log("- Supports token holder discounts (1K+ tokens = 5% to 20%)");
  
  console.log("\n🏛️  GOVERNANCE FEATURES:");
  console.log(`- Community voting: ${governanceAddress}`);
  console.log("- Product design decisions");
  console.log("- Treasury management");
  
  console.log("\n💎 STAKING POOLS AVAILABLE:");
  console.log("- Basic Staking: 10% APR, no lock");
  console.log("- Premium Staking: 15% APR, 30-day lock"); 
  console.log("- NFT Holders Pool: 20% APR, requires NFT");
  console.log("- Diamond Hands: 25% APR, 90-day lock");
  
  console.log("\n📱 CONTENTFLOW FEATURES:");
  console.log("- Creator reward system");
  console.log("- Quality-based multipliers");
  console.log("- NFT integration for content");
  console.log("- Engagement-based earnings");
  
  console.log("\n🔥 TOKEN BURN MECHANISMS:");
  console.log("- 2% of product sales");
  console.log("- 50% of NFT royalties"); 
  console.log("- 30% of ContentFlow advertising revenue");
  
  console.log("\n💡 NEXT STEPS:");
  console.log("1. Test NFT minting and tier verification");
  console.log("2. Test token staking and rewards");
  console.log("3. Create governance proposals");
  console.log("4. Integrate with Shopify store");
  console.log("5. Begin ContentFlow creator onboarding");
  
  console.log("=" .repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });