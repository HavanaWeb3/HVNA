const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const USER_ADDRESS = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  const tokenABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, ethers.provider);

  console.log("🔍 CHECKING ACTUAL TOKEN BALANCE:\n");
  console.log("   Token:", TOKEN_ADDRESS);
  console.log("   User:", USER_ADDRESS, "\n");

  const balance = await token.balanceOf(USER_ADDRESS);
  const decimals = await token.decimals();
  const symbol = await token.symbol();

  console.log("📊 RESULT:\n");
  console.log("   Raw balance:", balance.toString());
  console.log("   Decimals:", decimals);
  console.log("   Formatted balance:", ethers.formatUnits(balance, decimals), symbol);
  console.log("   As number:", parseFloat(ethers.formatUnits(balance, decimals)));

  console.log("\n🧮 CHECKING CALCULATION:\n");
  const balanceNum = parseFloat(ethers.formatUnits(balance, decimals));
  console.log("   JavaScript calculation:", balanceNum.toLocaleString('en-US'));

  // Check if it's actually 50,001,000
  if (balanceNum > 50000000) {
    console.log("\n⚠️  You actually DO have 50+ million tokens!");
    console.log("   This might be from the old compromised wallet/contract.");
  } else {
    console.log("\n✅ You have", balanceNum, "tokens (display bug on website)");
  }
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
