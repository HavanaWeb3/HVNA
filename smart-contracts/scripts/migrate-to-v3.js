const hre = require("hardhat");

async function main() {
  console.log("\n🔄 MIGRATING FROM V2 TO V3\n");

  const V2_ADDRESS = "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B";
  const V3_ADDRESS = "0x2cCE8fA9C5A369145319EB4906a47B319c639928";
  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const BUYER_ADDRESS = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  console.log("V2 Presale:", V2_ADDRESS);
  console.log("V3 Presale:", V3_ADDRESS);
  console.log("Buyer:", BUYER_ADDRESS);

  // Get contracts
  const token = await hre.ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", TOKEN_ADDRESS);
  const v2Presale = await hre.ethers.getContractAt("TokenPreSaleVesting", V2_ADDRESS);
  const v3Presale = await hre.ethers.getContractAt("TokenPreSaleVesting", V3_ADDRESS);

  console.log("\n📊 CHECKING V2 STATE...");
  const v2Purchased = await v2Presale.getPurchasedTokens(BUYER_ADDRESS);
  const v2TokensSold = await v2Presale.tokensSold();
  const v2Active = await v2Presale.saleActive();

  console.log("V2 Purchased by buyer:", hre.ethers.formatEther(v2Purchased), "HVNA");
  console.log("V2 Total sold:", hre.ethers.formatEther(v2TokensSold), "HVNA");
  console.log("V2 Sale active:", v2Active);

  if (v2Active) {
    console.log("\n⏸️  Deactivating V2 sale...");
    const tx = await v2Presale.toggleSale();
    await tx.wait();
    console.log("✅ V2 sale deactivated");
  }

  console.log("\n💰 TRANSFERRING TOKENS TO V3...");
  const v2Balance = await token.balanceOf(V2_ADDRESS);
  console.log("V2 has", hre.ethers.formatEther(v2Balance), "HVNA");

  if (v2Balance > 0) {
    console.log("Withdrawing from V2...");
    const withdrawTx = await v2Presale.withdrawUnsoldTokens();
    await withdrawTx.wait();
    console.log("✅ Tokens withdrawn from V2");
  }

  // Transfer 25M to V3
  const amountToTransfer = hre.ethers.parseEther("25000000");
  console.log("\nTransferring 25M HVNA to V3...");
  const transferTx = await token.transfer(V3_ADDRESS, amountToTransfer);
  await transferTx.wait();
  console.log("✅ 25M HVNA transferred to V3");

  // Migrate purchase record
  console.log("\n🔄 MIGRATING PURCHASE RECORD...");
  const migrateTx = await v3Presale.migratePurchase(BUYER_ADDRESS, v2Purchased);
  await migrateTx.wait();
  console.log("✅ Purchase migrated");

  // Update phase to PUBLIC
  console.log("\n📅 UPDATING V3 PHASE...");
  const updatePhaseTx = await v3Presale.updatePhase();
  await updatePhaseTx.wait();
  console.log("✅ Phase updated");

  // Activate V3 sale
  console.log("\n▶️  ACTIVATING V3 SALE...");
  const toggleTx = await v3Presale.toggleSale();
  await toggleTx.wait();
  console.log("✅ V3 sale activated");

  // Verify V3 state
  console.log("\n✅ VERIFYING V3 STATE...");
  const v3Purchased = await v3Presale.getPurchasedTokens(BUYER_ADDRESS);
  const v3TokensSold = await v3Presale.tokensSold();
  const v3Active = await v3Presale.saleActive();
  const v3Balance = await token.balanceOf(V3_ADDRESS);
  const v3Phase = await v3Presale.currentPhase();

  console.log("V3 Purchased by buyer:", hre.ethers.formatEther(v3Purchased), "HVNA ✅");
  console.log("V3 Total sold:", hre.ethers.formatEther(v3TokensSold), "HVNA");
  console.log("V3 Balance:", hre.ethers.formatEther(v3Balance), "HVNA");
  console.log("V3 Phase:", v3Phase === 0n ? "GENESIS" : v3Phase === 1n ? "PUBLIC" : "ENDED");
  console.log("V3 Sale active:", v3Active);

  console.log("\n🎉 MIGRATION COMPLETE!");
  console.log("\n📝 NEXT STEPS:");
  console.log("   1. Update website to V3 address: " + V3_ADDRESS);
  console.log("   2. Test purchase on website");
  console.log("   3. Verify purchase limits ($10 min, $10,000 max)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
