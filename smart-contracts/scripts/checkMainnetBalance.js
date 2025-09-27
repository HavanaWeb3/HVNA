const { ethers } = require("hardhat");

async function main() {
  console.log("=== CHECKING ETHEREUM MAINNET BALANCES ===");
  
  const addresses = [
    "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5", // Your main wallet
    "0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66"  // Deployer wallet
  ];
  
  // Ethereum mainnet provider
  const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
  
  try {
    for (const address of addresses) {
      console.log(`\nChecking: ${address}`);
      
      const balance = await provider.getBalance(address);
      const balanceETH = ethers.formatEther(balance);
      
      console.log(`Balance: ${balanceETH} ETH`);
      
      // Get transaction count to see recent activity  
      const txCount = await provider.getTransactionCount(address);
      console.log(`Transaction count: ${txCount}`);
    }
    
  } catch (error) {
    console.error("Error checking mainnet:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });