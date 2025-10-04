const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Withdrawing ETH from presale with wallet:", signer.address, "\n");

  const PRESALE_ADDRESS = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";

  const presaleABI = [
    "function withdrawETH() external"
  ];

  const presale = new ethers.Contract(PRESALE_ADDRESS, presaleABI, signer);

  console.log("📊 CHECKING ETH BALANCE:\n");

  const ethBalance = await ethers.provider.getBalance(PRESALE_ADDRESS);
  console.log("   ETH in presale:", ethers.formatEther(ethBalance), "ETH");

  if (ethBalance === 0n) {
    console.log("\n✅ No ETH to withdraw");
    return;
  }

  const deployerBalanceBefore = await ethers.provider.getBalance(signer.address);
  console.log("   Your balance before:", ethers.formatEther(deployerBalanceBefore), "ETH");

  console.log("\n💰 WITHDRAWING ETH:\n");

  const tx = await presale.withdrawETH();
  console.log("   Transaction:", tx.hash);
  const receipt = await tx.wait();

  console.log("   ✅ ETH withdrawn!");

  const deployerBalanceAfter = await ethers.provider.getBalance(signer.address);
  console.log("\n📊 FINAL BALANCES:\n");
  console.log("   Your balance after:", ethers.formatEther(deployerBalanceAfter), "ETH");
  console.log("   Presale balance:", ethers.formatEther(await ethers.provider.getBalance(PRESALE_ADDRESS)), "ETH");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
