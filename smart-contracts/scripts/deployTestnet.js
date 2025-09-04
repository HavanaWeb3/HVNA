const hre = require("hardhat");

async function main() {
  console.log("🌐 Deploying HVNA Ecosystem to Sepolia Testnet...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.1")) {
    console.log("❌ Insufficient balance! Need at least 0.1 ETH for deployment.");
    console.log("🚰 Get Sepolia ETH from: https://sepoliafaucet.com/");
    return;
  }
  
  console.log("=" .repeat(60));

  // Deploy Core Contracts (Essential for Presale)
  console.log("📄 Deploying Core Contracts...");
  
  // 1. Deploy HVNA Token
  console.log("1️⃣  Deploying HVNA Token...");
  const HVNAToken = await hre.ethers.getContractFactory("HVNAToken");
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

  // 3. Deploy Token Sale (Most Important)
  console.log("3️⃣  Deploying Token Sale Contract...");
  const TokenSale = await hre.ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(hvnaAddress);
  await tokenSale.waitForDeployment();
  const tokenSaleAddress = await tokenSale.getAddress();
  console.log("✅ Token Sale:", tokenSaleAddress);

  // 4. Deploy Treasury
  console.log("4️⃣  Deploying Treasury Contract...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(hvnaAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ Treasury:", treasuryAddress);

  console.log("\n" + "=" .repeat(60));
  console.log("💰 Setting up Token Distribution...");

  try {
    // Transfer 35M tokens to presale
    const saleAmount = hre.ethers.parseEther("35000000"); // 35M for presale
    console.log("📤 Transferring 35M HVNA to Token Sale...");
    await hvnaToken.transfer(tokenSaleAddress, saleAmount);
    console.log("✅ Token distribution completed");
  } catch (error) {
    console.log("⚠️  Token distribution error:", error.message);
  }

  console.log("\n🎉 TESTNET DEPLOYMENT COMPLETE! 🎉");
  console.log("=" .repeat(80));
  console.log("📋 SEPOLIA TESTNET ADDRESSES:");
  console.log("=" .repeat(80));
  console.log(`HVNA Token:           ${hvnaAddress}`);
  console.log(`Boldly Elephunky NFT: ${nftAddress}`);
  console.log(`Token Sale:           ${tokenSaleAddress}`);
  console.log(`Treasury:             ${treasuryAddress}`);
  console.log("=" .repeat(80));
  
  console.log("\n🔧 NEXT STEPS:");
  console.log("1. Update frontend/index.html with new contract addresses");
  console.log("2. Test presale widget with MetaMask on Sepolia");
  console.log("3. Share presale link with your community");
  
  console.log("\n📱 FRONTEND UPDATE NEEDED:");
  console.log("Update these lines in frontend/index.html:");
  console.log(`const CONTRACT_ADDRESS = "${tokenSaleAddress}";`);
  console.log(`const HVNA_ADDRESS = "${hvnaAddress}";`);
  
  console.log("\n🌐 ETHERSCAN LINKS:");
  console.log(`Token: https://sepolia.etherscan.io/address/${hvnaAddress}`);
  console.log(`Sale: https://sepolia.etherscan.io/address/${tokenSaleAddress}`);
  console.log(`NFT: https://sepolia.etherscan.io/address/${nftAddress}`);
  
  console.log("\n🚀 Your presale is now LIVE on Sepolia testnet!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });