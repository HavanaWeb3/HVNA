const { ethers } = require("hardhat");

async function main() {
  // Your wallet address
  const userAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  
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
    console.log("Checking purchased tokens for address:", userAddress);
    console.log("Contract address:", contractAddress);
    
    // Call the purchasedAmount function
    const result = await contract.purchasedAmount(userAddress);
    
    console.log("Raw result (wei):", result.toString());
    console.log("Tokens purchased:", ethers.formatUnits(result, 18));
    
    // Also try to get the function selector
    const iface = new ethers.Interface(contractABI);
    const selector = iface.getFunction("purchasedAmount").selector;
    console.log("Function selector:", selector);
    
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