const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deactivating and recovering from old presale:", signer.address, "\n");

  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const OLD_PRESALE = "0x00e59916fEb5995E5657c68c71929B2E28E100d0";

  const tokenABI = ["function balanceOf(address) view returns (uint256)"];
  const presaleABI = [
    "function saleActive() view returns (bool)",
    "function toggleSale() external",
    "function withdrawUnsoldTokens() external"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, ethers.provider);
  const oldPresale = new ethers.Contract(OLD_PRESALE, presaleABI, signer);

  console.log("📊 STEP 1: Check sale status\n");

  const saleActive = await oldPresale.saleActive();
  console.log("   Sale active:", saleActive);

  const balance = await token.balanceOf(OLD_PRESALE);
  console.log("   Token balance:", ethers.formatUnits(balance, 18), "HVNA");

  if (saleActive) {
    console.log("\n🔄 STEP 2: Deactivate sale\n");
    const toggleTx = await oldPresale.toggleSale();
    console.log("   Transaction:", toggleTx.hash);
    await toggleTx.wait();
    console.log("   ✅ Sale deactivated");
  } else {
    console.log("\n✅ Sale already inactive");
  }

  console.log("\n💰 STEP 3: Withdraw tokens\n");

  const withdrawTx = await oldPresale.withdrawUnsoldTokens();
  console.log("   Transaction:", withdrawTx.hash);
  await withdrawTx.wait();
  console.log("   ✅ Tokens withdrawn!");

  const newDeployerBalance = await token.balanceOf(signer.address);
  console.log("\n📊 NEW BALANCES:\n");
  console.log("   Your balance:", ethers.formatUnits(newDeployerBalance, 18), "HVNA");
  console.log("   Old presale:", ethers.formatUnits(await token.balanceOf(OLD_PRESALE), 18), "HVNA");

  console.log("\n✅ RECOVERED 25M TOKENS!");
  console.log("   You should now have 75M + 1K = 75,001,000 HVNA");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
