const { ethers } = require("hardhat");

async function main() {
  console.log("=== WITHDRAWING ETH FROM PRESALE CONTRACT ===");
  
  // Contract address
  const contractAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  
  // Get the deployer account (contract owner)
  const [deployer] = await ethers.getSigners();
  console.log("Withdrawing with account:", deployer.address);
  
  // Contract ABI for withdraw function
  const contractABI = [
    "function withdrawETH() public",
    "function owner() public view returns (address)"
  ];
  
  // Connect to the contract
  const contract = new ethers.Contract(contractAddress, contractABI, deployer);
  
  try {
    // Check contract balance before withdrawal
    const provider = ethers.provider;
    const contractBalance = await provider.getBalance(contractAddress);
    console.log("Contract balance before withdrawal:", ethers.formatEther(contractBalance), "ETH");
    
    if (contractBalance == 0) {
      console.log("❌ No funds to withdraw");
      return;
    }
    
    // Check deployer balance before
    const deployerBalanceBefore = await provider.getBalance(deployer.address);
    console.log("Deployer balance before:", ethers.formatEther(deployerBalanceBefore), "ETH");
    
    // Withdraw funds
    console.log("🔄 Calling withdrawETH()...");
    const tx = await contract.withdrawETH();
    console.log("Transaction hash:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Withdrawal confirmed in block:", receipt.blockNumber);
    
    // Check balances after
    const contractBalanceAfter = await provider.getBalance(contractAddress);
    const deployerBalanceAfter = await provider.getBalance(deployer.address);
    
    console.log("\n=== FINAL BALANCES ===");
    console.log("Contract balance after:", ethers.formatEther(contractBalanceAfter), "ETH");
    console.log("Deployer balance after:", ethers.formatEther(deployerBalanceAfter), "ETH");
    
    const withdrawn = contractBalance - contractBalanceAfter;
    console.log("💰 Amount withdrawn:", ethers.formatEther(withdrawn), "ETH");
    
  } catch (error) {
    console.error("❌ Error withdrawing funds:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });