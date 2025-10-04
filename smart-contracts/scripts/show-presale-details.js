const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const PRESALE_ADDRESS = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";

  const tokenABI = ["function balanceOf(address) view returns (uint256)"];
  const presaleABI = ["function owner() view returns (address)"];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, ethers.provider);
  const presale = new ethers.Contract(PRESALE_ADDRESS, presaleABI, ethers.provider);

  console.log("📊 PRESALE CONTRACT DETAILS:\n");
  console.log("   Presale Address:", PRESALE_ADDRESS);

  const presaleTokenBalance = await token.balanceOf(PRESALE_ADDRESS);
  console.log("   Token Balance:", ethers.formatUnits(presaleTokenBalance, 18), "HVNA");

  const presaleETHBalance = await ethers.provider.getBalance(PRESALE_ADDRESS);
  console.log("   ETH Balance:", ethers.formatEther(presaleETHBalance), "ETH");

  const owner = await presale.owner();
  console.log("   Owner:", owner);

  console.log("\n🔍 HOW TO VIEW:\n");
  console.log("   1. Token balance in presale:");
  console.log("      https://basescan.org/token/" + TOKEN_ADDRESS + "?a=" + PRESALE_ADDRESS);
  console.log("\n   2. ETH received from sales:");
  console.log("      https://basescan.org/address/" + PRESALE_ADDRESS);
  console.log("\n   3. Your website should show this in an admin panel");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
