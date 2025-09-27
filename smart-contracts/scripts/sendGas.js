const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  
  console.log("Sending gas from:", deployer.address);
  console.log("To compromised wallet:", compromisedWallet);
  
  const tx = await deployer.sendTransaction({
    to: compromisedWallet,
    value: ethers.parseEther("0.001") // Just enough for approval
  });
  
  console.log("Gas sent:", tx.hash);
  await tx.wait();
  console.log("✅ Gas transfer complete");
}

main().catch(console.error);