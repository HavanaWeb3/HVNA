const { ethers } = require("hardhat");

async function main() {
  console.log("=== CHECKING CONTRACT OWNERSHIP ===");
  
  const tokenSaleAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  const [currentSigner] = await ethers.getSigners();
  
  console.log("Contract address:", tokenSaleAddress);
  console.log("Current signer:", currentSigner.address);
  
  const tokenSale = await ethers.getContractAt("TokenPreSaleFixed", tokenSaleAddress);
  
  try {
    const owner = await tokenSale.owner();
    console.log("Contract owner:", owner);
    
    const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    const newSecureWallet = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
    
    console.log("Compromised wallet:", compromisedWallet);
    console.log("New secure wallet:", newSecureWallet);
    
    if (owner.toLowerCase() === compromisedWallet.toLowerCase()) {
      console.log("⚠️  Contract is owned by COMPROMISED wallet");
      console.log("Need to transfer ownership first");
    } else if (owner.toLowerCase() === newSecureWallet.toLowerCase()) {
      console.log("✅ Contract is already owned by secure wallet");
    } else {
      console.log("❓ Contract is owned by a different wallet");
    }
    
    // Check contract balance
    const balance = await ethers.provider.getBalance(tokenSaleAddress);
    console.log("Contract balance:", ethers.formatEther(balance), "ETH");
    
  } catch (error) {
    console.error("Error checking ownership:", error.message);
  }
}

main().catch(console.error);