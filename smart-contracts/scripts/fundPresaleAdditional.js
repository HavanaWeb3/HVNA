const hre = require("hardhat");

async function main() {
  console.log("💰 Adding Additional 10M HVNA to Pre-Sale Contract...\n");
  
  // Create deployer wallet
  const provider = new hre.ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const deployer = new hre.ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  // Contract addresses from recent deployment
  const hvnaTokenAddress = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
  const presaleAddress = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
  
  console.log("Deployer:", deployer.address);
  console.log("HVNA Token:", hvnaTokenAddress);
  console.log("Pre-Sale Contract:", presaleAddress);
  
  // Connect to HVNA token contract
  const hvnaToken = await hre.ethers.getContractAt("HVNAToken", hvnaTokenAddress, deployer);
  
  // Check current balances
  const deployerBalance = await hvnaToken.balanceOf(deployer.address);
  const presaleBalance = await hvnaToken.balanceOf(presaleAddress);
  
  console.log("\nCurrent Balances:");
  console.log("- Deployer:", hre.ethers.formatEther(deployerBalance), "HVNA");
  console.log("- Pre-Sale Contract:", hre.ethers.formatEther(presaleBalance), "HVNA");
  
  // Transfer additional 10M tokens (25M total - 15M already sent = 10M more)
  const additionalAmount = hre.ethers.parseEther("10000000"); // 10M tokens
  
  console.log("\nTransferring additional 10M HVNA tokens...");
  const tx = await hvnaToken.transfer(presaleAddress, additionalAmount);
  await tx.wait();
  
  // Check new balances
  const newDeployerBalance = await hvnaToken.balanceOf(deployer.address);
  const newPresaleBalance = await hvnaToken.balanceOf(presaleAddress);
  
  console.log("\n✅ Transfer complete!");
  console.log("New Balances:");
  console.log("- Deployer:", hre.ethers.formatEther(newDeployerBalance), "HVNA");
  console.log("- Pre-Sale Contract:", hre.ethers.formatEther(newPresaleBalance), "HVNA");
  
  console.log("\n🎯 Pre-Sale Contract now funded with 25M HVNA tokens!");
  console.log("- Genesis Phase: 5M tokens available");
  console.log("- Public Phase: 20M tokens available");
  console.log("- Total Pre-Sale: 25M tokens (25% of total supply)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });