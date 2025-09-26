const { ethers } = require("hardhat");

async function main() {
  // Wallet addresses
  const purchaser = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  const deployer = "0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66";
  const contractAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  
  // Get provider
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  try {
    console.log("=== WALLET BALANCES ===");
    
    // Check purchaser balance
    const purchaserBalance = await provider.getBalance(purchaser);
    console.log(`Purchaser (${purchaser}): ${ethers.formatEther(purchaserBalance)} ETH`);
    
    // Check deployer balance
    const deployerBalance = await provider.getBalance(deployer);
    console.log(`Deployer (${deployer}): ${ethers.formatEther(deployerBalance)} ETH`);
    
    // Check contract balance
    const contractBalance = await provider.getBalance(contractAddress);
    console.log(`Contract (${contractAddress}): ${ethers.formatEther(contractBalance)} ETH`);
    
    console.log("\n=== TOKEN PURCHASES ===");
    
    // Contract ABI for checking purchases
    const contractABI = [
      "function purchasedAmount(address) public view returns (uint256)",
      "function tokensSold() public view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Check purchaser's tokens
    const purchasedTokens = await contract.purchasedAmount(purchaser);
    console.log(`${purchaser} purchased: ${ethers.formatUnits(purchasedTokens, 18)} tokens`);
    
    // Check total tokens sold
    const totalSold = await contract.tokensSold();
    console.log(`Total tokens sold: ${ethers.formatUnits(totalSold, 18)} tokens`);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });