const hre = require("hardhat");

async function main() {
  const V3_ADDRESS = "0x2cCE8fA9C5A369145319EB4906a47B319c639928";
  const BUYER_ADDRESS = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  console.log("\n🔍 VERIFYING V3 PRESALE LIMITS\n");
  console.log("Contract:", V3_ADDRESS);

  const presale = await hre.ethers.getContractAt("TokenPreSaleVesting", V3_ADDRESS);

  // Get purchase limits
  const minPurchase = await presale.minPurchase();
  const maxPurchaseGenesis = await presale.maxPurchaseGenesis();
  const maxPurchasePublic = await presale.maxPurchasePublic();

  console.log("📊 PURCHASE LIMITS:");
  console.log("   Minimum:", hre.ethers.formatEther(minPurchase), "tokens");
  console.log("   - In USD: $" + (parseFloat(hre.ethers.formatEther(minPurchase)) * 0.01).toFixed(2));
  console.log("\n   Maximum (Genesis):", hre.ethers.formatEther(maxPurchaseGenesis), "tokens");
  console.log("   - In USD: $" + (parseFloat(hre.ethers.formatEther(maxPurchaseGenesis)) * 0.01).toLocaleString());
  console.log("\n   Maximum (Public):", hre.ethers.formatEther(maxPurchasePublic), "tokens");
  console.log("   - In USD: $" + (parseFloat(hre.ethers.formatEther(maxPurchasePublic)) * 0.01).toLocaleString());

  // Get contract state
  const tokensSold = await presale.tokensSold();
  const saleActive = await presale.saleActive();
  const currentPhase = await presale.currentPhase();
  const purchased = await presale.getPurchasedTokens(BUYER_ADDRESS);
  const priceUSDCents = await presale.tokenPriceUSDCents();

  console.log("\n📈 CONTRACT STATE:");
  console.log("   Tokens Sold:", hre.ethers.formatEther(tokensSold), "HVNA");
  console.log("   Sale Active:", saleActive);
  console.log("   Phase:", currentPhase === 0n ? "GENESIS" : currentPhase === 1n ? "PUBLIC" : "ENDED");
  console.log("   Token Price:", priceUSDCents.toString(), "cents ($" + (Number(priceUSDCents) / 100) + ")");
  console.log("\n   Buyer Purchase:", hre.ethers.formatEther(purchased), "HVNA");
  console.log("   - In USD: $" + (parseFloat(hre.ethers.formatEther(purchased)) * 0.01).toFixed(2));

  console.log("\n✅ VERIFICATION COMPLETE");
  console.log("\n✨ NEW FEATURES:");
  console.log("   - Owner can update limits with setPurchaseLimits()");
  console.log("   - Owner can migrate purchases with migratePurchase()");
}

main().catch(console.error);
