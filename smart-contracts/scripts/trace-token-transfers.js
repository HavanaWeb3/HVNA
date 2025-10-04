const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const DEPLOYER = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  console.log("🔍 TRACING TOKEN TRANSFERS:\n");

  const tokenABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, ethers.provider);

  // Get all Transfer events from the deployer
  const filter = token.filters.Transfer(DEPLOYER);
  const events = await token.queryFilter(filter, 0, 'latest');

  console.log("📤 OUTGOING TRANSFERS FROM DEPLOYER:\n");

  let totalSent = 0n;

  for (const event of events) {
    const amount = event.args.value;
    const to = event.args.to;
    const block = await event.getBlock();

    console.log("   Block:", block.number);
    console.log("   To:", to);
    console.log("   Amount:", ethers.formatUnits(amount, 18), "HVNA");
    console.log("   Tx:", event.transactionHash);
    console.log("");

    totalSent += amount;
  }

  console.log("📊 SUMMARY:\n");
  console.log("   Total sent:", ethers.formatUnits(totalSent, 18), "HVNA");
  console.log("   Started with: 100,000,000 HVNA");
  console.log("   Should have left:", ethers.formatUnits(100000000n * 10n**18n - totalSent, 18), "HVNA");

  // Check current balance
  const balanceABI = ["function balanceOf(address) view returns (uint256)"];
  const tokenBalance = new ethers.Contract(TOKEN_ADDRESS, balanceABI, ethers.provider);
  const currentBalance = await tokenBalance.balanceOf(DEPLOYER);

  console.log("   Actual balance:", ethers.formatUnits(currentBalance, 18), "HVNA");

  const difference = (100000000n * 10n**18n - totalSent) - currentBalance;
  if (difference !== 0n) {
    console.log("\n⚠️  DISCREPANCY:", ethers.formatUnits(difference, 18), "HVNA");
    console.log("   Checking incoming transfers...");

    const filterIn = token.filters.Transfer(null, DEPLOYER);
    const eventsIn = await token.queryFilter(filterIn, 0, 'latest');

    console.log("\n📥 INCOMING TRANSFERS TO DEPLOYER:\n");

    for (const event of eventsIn) {
      if (event.args.from === ethers.ZeroAddress) {
        console.log("   ✅ Initial mint:", ethers.formatUnits(event.args.value, 18), "HVNA");
      } else {
        console.log("   From:", event.args.from);
        console.log("   Amount:", ethers.formatUnits(event.args.value, 18), "HVNA");
        console.log("   Tx:", event.transactionHash);
        console.log("");
      }
    }
  }
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
