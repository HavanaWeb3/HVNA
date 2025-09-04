const hre = require("hardhat");

async function main() {
  console.log("🐘 Deploying Havana Elephant Brand Web3 Ecosystem...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log();

  // Deploy HVNA Token
  console.log("📄 Deploying HVNA Token...");
  const HVNAToken = await hre.ethers.getContractFactory("HVNAToken");
  const hvnaToken = await HVNAToken.deploy();
  await hvnaToken.waitForDeployment();
  console.log("✅ HVNA Token deployed to:", await hvnaToken.getAddress());
  console.log();

  // Deploy Boldly Elephunky NFT
  console.log("🎨 Deploying Boldly Elephunky NFT...");
  const BoldlyElephunkyNFT = await hre.ethers.getContractFactory("BoldlyElephunkyNFT");
  const nftContract = await BoldlyElephunkyNFT.deploy();
  await nftContract.waitForDeployment();
  console.log("✅ Boldly Elephunky NFT deployed to:", await nftContract.getAddress());
  console.log();

  // Deploy Token Sale
  console.log("💰 Deploying Token Sale Contract...");
  const TokenSale = await hre.ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(await hvnaToken.getAddress());
  await tokenSale.waitForDeployment();
  console.log("✅ Token Sale deployed to:", await tokenSale.getAddress());
  console.log();

  // Transfer tokens to sale contract
  console.log("🔄 Transferring tokens to sale contract...");
  const saleAmount = hre.ethers.parseEther("30000000"); // 30M tokens
  await hvnaToken.transfer(await tokenSale.getAddress(), saleAmount);
  console.log("✅ Transferred 30M HVNA tokens to sale contract");
  console.log();

  console.log("🎉 Deployment Complete!");
  console.log("=====================================");
  console.log("HVNA Token:          ", await hvnaToken.getAddress());
  console.log("Boldly Elephunky NFT:", await nftContract.getAddress());
  console.log("Token Sale:          ", await tokenSale.getAddress());
  console.log("=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });