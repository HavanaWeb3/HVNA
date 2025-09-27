const { ethers } = require("hardhat");

async function main() {
  console.log("=== WITHDRAWING ETH FROM TOKEN SALE CONTRACT ===");
  
  const tokenSaleAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  const [deployer] = await ethers.getSigners();
  
  console.log("Withdrawing from contract:", tokenSaleAddress);
  console.log("To secure wallet:", deployer.address);
  
  // Connect to the token sale contract
  const tokenSale = await ethers.getContractAt("TokenPreSaleFixed", tokenSaleAddress);
  
  // Check contract balance before withdrawal
  const balanceBefore = await ethers.provider.getBalance(tokenSaleAddress);
  console.log("Contract balance before:", ethers.formatEther(balanceBefore), "ETH");
  
  if (balanceBefore === 0n) {
    console.log("❌ No ETH to withdraw");
    return;
  }
  
  // Check our wallet balance before
  const walletBalanceBefore = await ethers.provider.getBalance(deployer.address);
  console.log("Wallet balance before:", ethers.formatEther(walletBalanceBefore), "ETH");
  
  try {
    console.log("🚀 Executing withdrawal...");
    
    // Call withdrawETH function
    const tx = await tokenSale.withdrawETH();
    
    console.log("📤 Transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ WITHDRAWAL SUCCESSFUL!");
      
      // Check balances after withdrawal
      const balanceAfter = await ethers.provider.getBalance(tokenSaleAddress);
      const walletBalanceAfter = await ethers.provider.getBalance(deployer.address);
      
      console.log("Contract balance after:", ethers.formatEther(balanceAfter), "ETH");
      console.log("Wallet balance after:", ethers.formatEther(walletBalanceAfter), "ETH");
      
      const withdrawnAmount = balanceBefore;
      console.log("💰 Withdrawn amount:", ethers.formatEther(withdrawnAmount), "ETH");
      console.log("💵 USD value (approx):", "$" + (parseFloat(ethers.formatEther(withdrawnAmount)) * 3500).toFixed(2));
      console.log("🔗 Transaction:", `https://basescan.org/tx/${tx.hash}`);
      
    } else {
      console.log("❌ Withdrawal transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Withdrawal failed:", error.message);
    
    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log("💡 Make sure you're using the correct owner wallet");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });