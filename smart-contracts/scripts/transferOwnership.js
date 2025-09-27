const { ethers } = require("hardhat");

async function main() {
  console.log("=== TRANSFERRING CONTRACT OWNERSHIP ===");
  
  const tokenSaleAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  const newOwner = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05"; // Your secure Rabby wallet
  
  const [currentSigner] = await ethers.getSigners();
  console.log("Current signer:", currentSigner.address);
  console.log("New owner will be:", newOwner);
  
  const tokenSale = await ethers.getContractAt("TokenPreSaleFixed", tokenSaleAddress);
  
  try {
    const currentOwner = await tokenSale.owner();
    console.log("Current contract owner:", currentOwner);
    
    if (currentOwner.toLowerCase() === currentSigner.address.toLowerCase()) {
      console.log("✅ You are the current owner, proceeding with transfer...");
      
      const tx = await tokenSale.transferOwnership(newOwner);
      console.log("📤 Ownership transfer submitted:", tx.hash);
      
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log("✅ OWNERSHIP TRANSFERRED SUCCESSFULLY!");
        console.log("🔗 Transaction:", `https://basescan.org/tx/${tx.hash}`);
        
        // Verify new owner
        const verifyOwner = await tokenSale.owner();
        console.log("New owner verified:", verifyOwner);
        
        if (verifyOwner.toLowerCase() === newOwner.toLowerCase()) {
          console.log("🎉 Ready to withdraw ETH with your secure wallet!");
        }
      } else {
        console.log("❌ Ownership transfer failed");
      }
      
    } else {
      console.log("❌ You are not the current owner");
      console.log("Current owner:", currentOwner);
      console.log("Your address:", currentSigner.address);
    }
    
  } catch (error) {
    console.error("❌ Transfer failed:", error.message);
  }
}

main().catch(console.error);