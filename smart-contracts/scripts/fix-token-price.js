const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Fixing token price with wallet:", signer.address, "\n");

  const NEW_PRESALE = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";

  const presaleABI = [
    "function tokenPriceUSDCents() view returns (uint256)",
    "function genesisDiscountPercent() view returns (uint256)",
    "function setPricing(uint256 _tokenPriceUSDCents, uint256 _genesisDiscountPercent) external",
    "function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) view returns (uint256 ethCost, uint256 usdCost)"
  ];

  const presale = new ethers.Contract(NEW_PRESALE, presaleABI, signer);

  console.log("📊 CURRENT PRICING:\n");

  const currentPrice = await presale.tokenPriceUSDCents();
  const currentDiscount = await presale.genesisDiscountPercent();

  console.log("   Token Price:", currentPrice.toString(), "cents = $" + (Number(currentPrice) / 100).toFixed(2));
  console.log("   Genesis Discount:", currentDiscount.toString() + "%");

  console.log("\n🔧 FIXING PRICING:\n");

  const CORRECT_PRICE = 1; // 1 cent = $0.01
  const DISCOUNT = 30; // 30% discount

  console.log("   Setting token price to:", CORRECT_PRICE, "cent = $0.01");
  console.log("   Setting genesis discount to:", DISCOUNT + "%");

  const tx = await presale.setPricing(CORRECT_PRICE, DISCOUNT);
  console.log("   Transaction:", tx.hash);
  await tx.wait();

  console.log("   ✅ Pricing updated!");

  console.log("\n✅ NEW PRICING:\n");

  const newPrice = await presale.tokenPriceUSDCents();
  const newDiscount = await presale.genesisDiscountPercent();

  console.log("   Token Price:", newPrice.toString(), "cent = $" + (Number(newPrice) / 100).toFixed(2));
  console.log("   Genesis Discount:", newDiscount.toString() + "%");

  console.log("\n💰 TESTING COST FOR 1000 TOKENS:\n");

  const tokenAmount = ethers.parseUnits("1000", 18);
  const [ethCost, usdCost] = await presale.calculatePurchaseCost(tokenAmount, false);

  console.log("   ETH Cost:", ethers.formatEther(ethCost), "ETH");
  console.log("   USD Cost:", "$" + (Number(ethCost) * 4504).toFixed(2), "(at current ETH price)");

  console.log("\n✅ READY TO PURCHASE!");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
