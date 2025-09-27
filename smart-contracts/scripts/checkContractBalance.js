const { ethers } = require("hardhat");

async function main() {
  console.log("=== CHECKING TOKEN SALE CONTRACT BALANCE ===");
  
  // You'll need to provide the deployed contract address
  // Let's check if we can find it in deployment logs or you can provide it
  const tokenSaleAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E"; // Current active presale contract
  
  // Check contract balance
  const balance = await ethers.provider.getBalance(tokenSaleAddress);
  console.log("Contract address:", tokenSaleAddress);
  console.log("ETH balance:", ethers.formatEther(balance), "ETH");
  console.log("USD value (approx):", "$" + (parseFloat(ethers.formatEther(balance)) * 3500).toFixed(2));
  
  if (balance > 0) {
    console.log("✅ Ready to withdraw ETH to your secure wallet");
  } else {
    console.log("No ETH to withdraw");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });