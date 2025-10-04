const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const OLD_PRESALE = "0x00e59916fEb5995E5657c68c71929B2E28E100d0";
  const NEW_PRESALE = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";
  const DEPLOYER = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  const tokenABI = ["function balanceOf(address) view returns (uint256)"];
  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, ethers.provider);

  console.log("🔍 CHECKING ALL BALANCES:\n");

  const deployerBalance = await token.balanceOf(DEPLOYER);
  console.log("   Deployer:", ethers.formatUnits(deployerBalance, 18), "HVNA");

  const oldPresaleBalance = await token.balanceOf(OLD_PRESALE);
  console.log("   Old Presale:", ethers.formatUnits(oldPresaleBalance, 18), "HVNA");

  const newPresaleBalance = await token.balanceOf(NEW_PRESALE);
  console.log("   New Presale:", ethers.formatUnits(newPresaleBalance, 18), "HVNA");

  const total = deployerBalance + oldPresaleBalance + newPresaleBalance;
  console.log("\n📊 TOTAL ACCOUNTED FOR:", ethers.formatUnits(total, 18), "HVNA");
  console.log("   Total Supply: 100,000,000 HVNA");

  const missing = 100000000n * 10n**18n - total;
  if (missing !== 0n) {
    console.log("   ⚠️  Missing:", ethers.formatUnits(missing, 18), "HVNA");
  }

  console.log("\n🧮 MATH CHECK:\n");
  console.log("   If you started with 100M and transferred:");
  console.log("   - 25M to old presale");
  console.log("   - 25M to new presale");
  console.log("   You should have: 50M left");
  console.log("   You actually have:", ethers.formatUnits(deployerBalance, 18), "HVNA");
  console.log("   Difference:", ethers.formatUnits(deployerBalance - 50000000n * 10n**18n, 18), "HVNA");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
