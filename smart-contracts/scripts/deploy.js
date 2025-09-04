const hre = require("hardhat");

async function main() {
  console.log("🐘 Deploying HVNA Token...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const HVNAToken = await hre.ethers.getContractFactory("HVNAToken");
  const hvnaToken = await HVNAToken.deploy();
  await hvnaToken.waitForDeployment();
  
  console.log("✅ HVNA Token deployed to:", await hvnaToken.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });