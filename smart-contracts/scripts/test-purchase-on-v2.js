const hre = require("hardhat");

async function main() {
  const buyerAddress = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
  const presaleAddress = "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B";
  
  const presale = await hre.ethers.getContractAt("TokenPreSaleVesting", presaleAddress);
  
  console.log("\n=== TESTING NEW PRESALE V2 ===");
  console.log("Presale:", presaleAddress);
  console.log("Buyer:", buyerAddress, "\n");
  
  const saleActive = await presale.saleActive();
  const purchased = await presale.purchasedAmount(buyerAddress);
  const tokensSold = await presale.tokensSold();
  
  console.log("Sale active:", saleActive);
  console.log("Total sold:", hre.ethers.formatEther(tokensSold), "HVNA");
  console.log("Your purchase:", hre.ethers.formatEther(purchased), "HVNA");
  
  if (parseFloat(hre.ethers.formatEther(purchased)) > 0) {
    console.log("\n✅ SUCCESS - Website SHOULD show your tokens");
  } else {
    console.log("\n❌ PROBLEM - No tokens recorded!");
  }
}

main().catch(console.error);
