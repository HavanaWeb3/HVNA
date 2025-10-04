const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Migrating to vesting presale:", signer.address, "\n");

  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const OLD_PRESALE = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";
  const VESTING_PRESALE = "0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8";

  const tokenABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)"
  ];

  const presaleABI = [
    "function saleActive() view returns (bool)",
    "function toggleSale() external",
    "function withdrawUnsoldTokens() external",
    "function updatePhase() external",
    "function currentPhase() view returns (uint8)"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, signer);
  const oldPresale = new ethers.Contract(OLD_PRESALE, presaleABI, signer);
  const vestingPresale = new ethers.Contract(VESTING_PRESALE, presaleABI, signer);

  console.log("📊 STEP 1: Deactivate old presale and recover tokens\n");

  const oldSaleActive = await oldPresale.saleActive();
  console.log("   Old presale sale active:", oldSaleActive);

  if (oldSaleActive) {
    console.log("   Deactivating old presale...");
    const toggleTx = await oldPresale.toggleSale();
    await toggleTx.wait();
    console.log("   ✅ Old presale deactivated");
  }

  const oldBalance = await token.balanceOf(OLD_PRESALE);
  console.log("   Old presale balance:", ethers.formatUnits(oldBalance, 18), "HVNA");

  if (oldBalance > 0n) {
    console.log("   Withdrawing tokens...");
    const withdrawTx = await oldPresale.withdrawUnsoldTokens();
    await withdrawTx.wait();
    console.log("   ✅ Tokens recovered");
  }

  console.log("\n📤 STEP 2: Fund vesting presale with 25M tokens\n");

  const amount = ethers.parseUnits("25000000", 18);
  const transferTx = await token.transfer(VESTING_PRESALE, amount);
  console.log("   Transaction:", transferTx.hash);
  await transferTx.wait();
  console.log("   ✅ 25M tokens transferred");

  const vestingBalance = await token.balanceOf(VESTING_PRESALE);
  console.log("   Vesting presale balance:", ethers.formatUnits(vestingBalance, 18), "HVNA");

  console.log("\n🔓 STEP 3: Activate vesting presale\n");

  const toggleTx = await vestingPresale.toggleSale();
  console.log("   Transaction:", toggleTx.hash);
  await toggleTx.wait();
  console.log("   ✅ Sale activated");

  console.log("\n🔄 STEP 4: Update phase to Public\n");

  const phaseTx = await vestingPresale.updatePhase();
  console.log("   Transaction:", phaseTx.hash);
  await phaseTx.wait();

  const currentPhase = await vestingPresale.currentPhase();
  const phaseNames = ['Genesis', 'Public', 'Ended'];
  console.log("   ✅ Current Phase:", phaseNames[currentPhase]);

  console.log("\n✅ VESTING PRESALE IS READY!\n");
  console.log("   Presale Address:", VESTING_PRESALE);
  console.log("   Token Balance: 25M HVNA");
  console.log("   Sale Active: true");
  console.log("   Current Phase: Public");
  console.log("\n   🔒 VESTING SCHEDULE:");
  console.log("   - Tokens locked until you call enableVesting()");
  console.log("   - 40% released at vesting start");
  console.log("   - 40% released after 3 months");
  console.log("   - 20% released after 6 months");
  console.log("\n📝 Next: Update website with new presale address");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
