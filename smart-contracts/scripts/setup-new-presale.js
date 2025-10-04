const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Setting up new presale with wallet:", signer.address, "\n");

  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const OLD_PRESALE = "0x00e59916fEb5995E5657c68c71929B2E28E100d0";
  const NEW_PRESALE = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";

  const tokenABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)"
  ];

  const presaleABI = [
    "function withdrawTokens(uint256 amount) external",
    "function toggleSale() external",
    "function updatePhase() external",
    "function currentPhase() view returns (uint8)",
    "function saleActive() view returns (bool)"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, signer);
  const oldPresale = new ethers.Contract(OLD_PRESALE, presaleABI, signer);
  const newPresale = new ethers.Contract(NEW_PRESALE, presaleABI, signer);

  console.log("📊 STEP 1: Check token balances\n");

  const oldPresaleBalance = await token.balanceOf(OLD_PRESALE);
  const deployerBalance = await token.balanceOf(signer.address);

  console.log("   Old Presale Balance:", ethers.formatUnits(oldPresaleBalance, 18), "HVNA");
  console.log("   Deployer Balance:", ethers.formatUnits(deployerBalance, 18), "HVNA");

  console.log("\n🔄 STEP 2: Withdraw tokens from old presale\n");

  const withdrawTx = await oldPresale.withdrawTokens(oldPresaleBalance);
  console.log("   Transaction:", withdrawTx.hash);
  await withdrawTx.wait();
  console.log("   ✅ Tokens withdrawn from old presale");

  const newDeployerBalance = await token.balanceOf(signer.address);
  console.log("   New Deployer Balance:", ethers.formatUnits(newDeployerBalance, 18), "HVNA");

  console.log("\n📤 STEP 3: Transfer 25M tokens to new presale\n");

  const amount = ethers.parseUnits("25000000", 18);
  const transferTx = await token.transfer(NEW_PRESALE, amount);
  console.log("   Transaction:", transferTx.hash);
  await transferTx.wait();
  console.log("   ✅ 25M tokens transferred to new presale");

  const newPresaleBalance = await token.balanceOf(NEW_PRESALE);
  console.log("   New Presale Balance:", ethers.formatUnits(newPresaleBalance, 18), "HVNA");

  console.log("\n🔓 STEP 4: Activate the sale\n");

  const toggleTx = await newPresale.toggleSale();
  console.log("   Transaction:", toggleTx.hash);
  await toggleTx.wait();

  const saleActive = await newPresale.saleActive();
  console.log("   ✅ Sale Active:", saleActive);

  console.log("\n🔄 STEP 5: Update phase to Public\n");

  const phaseTx = await newPresale.updatePhase();
  console.log("   Transaction:", phaseTx.hash);
  await phaseTx.wait();

  const currentPhase = await newPresale.currentPhase();
  const phaseNames = ['Genesis', 'Public', 'Ended'];
  console.log("   ✅ Current Phase:", phaseNames[currentPhase]);

  console.log("\n✅ NEW PRESALE IS READY!\n");
  console.log("   Presale Address: " + NEW_PRESALE);
  console.log("   Token Balance: 25M HVNA");
  console.log("   Sale Active: true");
  console.log("   Current Phase: Public");
  console.log("\n📝 Next: Update website with new presale address");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
