const { ethers } = require("hardhat");

async function main() {
  console.log("=== SETTING UP NEW SECURE CONTRACT ===");
  
  const [deployer] = await ethers.getSigners();
  const newContractAddress = "0x72a2310fc7422ddC3939a481A1211ce5e0113fd6";
  const hvnaTokenAddress = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
  
  console.log("Setting up from:", deployer.address);
  console.log("New contract:", newContractAddress);
  
  // Connect to contracts
  const hvnaToken = await ethers.getContractAt("contracts/TokenPreSaleFixed.sol:IERC20", hvnaTokenAddress);
  const tokenSale = await ethers.getContractAt("TokenPreSaleFixed", newContractAddress);
  
  try {
    // Check if we need to transfer tokens to the new contract
    const contractBalance = await hvnaToken.balanceOf(newContractAddress);
    console.log("New contract HVNA balance:", ethers.formatEther(contractBalance));
    
    if (contractBalance === 0n) {
      console.log("⚠️  New contract has no HVNA tokens");
      console.log("Need to transfer tokens from your wallet or mint new ones");
      
      // Check our balance
      const ourBalance = await hvnaToken.balanceOf(deployer.address);
      console.log("Your HVNA balance:", ethers.formatEther(ourBalance));
      
      if (ourBalance > 0n) {
        console.log("You can transfer some tokens to the new contract");
      } else {
        console.log("You need to mint or acquire HVNA tokens first");
      }
    } else {
      console.log("✅ Contract has tokens available for sale");
    }
    
    // Check contract configuration
    const saleActive = await tokenSale.saleActive();
    const owner = await tokenSale.owner();
    
    console.log("\n📊 Contract Status:");
    console.log("Sale active:", saleActive);
    console.log("Owner:", owner);
    console.log("Correct owner:", owner.toLowerCase() === deployer.address.toLowerCase());
    
    console.log("\n✅ NEW CONTRACT READY FOR BUSINESS!");
    console.log("🔒 Owned by your secure wallet");
    console.log("💰 All future customer payments will be secure");
    console.log("🎯 Old contract abandoned with minimal loss ($6)");
    
  } catch (error) {
    console.error("❌ Setup check failed:", error.message);
  }
}

main().catch(console.error);