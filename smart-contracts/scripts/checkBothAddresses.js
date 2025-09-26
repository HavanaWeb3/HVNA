const { ethers } = require("hardhat");

async function main() {
  // Both possible address formats
  const address1 = "0x247e659f52b89a9c1c3c6cdfe8c07c3a3c8ca0a5"; // lowercase
  const address2 = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5"; // mixed case
  
  // Contract address
  const contractAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  
  // Get provider
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  // Contract ABI for purchasedAmount function
  const contractABI = [
    "function purchasedAmount(address) public view returns (uint256)"
  ];
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  
  try {
    console.log("=== CHECKING BOTH ADDRESS FORMATS ===");
    
    console.log("\nAddress 1 (lowercase):", address1);
    const result1 = await contract.purchasedAmount(address1);
    console.log("Tokens:", ethers.formatUnits(result1, 18));
    
    console.log("\nAddress 2 (mixed case):", address2);
    const result2 = await contract.purchasedAmount(address2);
    console.log("Tokens:", ethers.formatUnits(result2, 18));
    
    // Check if they're the same when normalized
    const normalized1 = ethers.getAddress(address1);
    const normalized2 = ethers.getAddress(address2);
    
    console.log("\n=== NORMALIZED ADDRESSES ===");
    console.log("Normalized 1:", normalized1);
    console.log("Normalized 2:", normalized2);
    console.log("Are they the same?", normalized1 === normalized2);
    
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