const hre = require("hardhat");

async function main() {
  const presaleAddress = "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B";

  const TIERS = {
    1: { range: "0-5M", price: 1, description: "Genesis Tier" },
    2: { range: "5M-10M", price: 5, description: "Early Believer" },
    3: { range: "10M-15M", price: 10, description: "Visionary" },
    4: { range: "15M-20M", price: 15, description: "Momentum" },
    5: { range: "20M-25M", price: 30, description: "Final Tier" }
  };

  const tierNumber = process.argv[2] ? parseInt(process.argv[2]) : null;

  if (!tierNumber || !TIERS[tierNumber]) {
    console.log("\nUsage: npx hardhat run scripts/update-price-tier.js --network base [1-5]\n");
    console.log("Tiers:");
    Object.entries(TIERS).forEach(([num, t]) => {
      console.log(num + ": " + t.range + " @ $0." + t.price.toString().padStart(2, '0'));
    });
    return;
  }

  const tier = TIERS[tierNumber];
  const presale = await hre.ethers.getContractAt("TokenPreSaleVesting", presaleAddress);

  console.log("\n=== UPDATING TO TIER " + tierNumber + " ===");
  console.log("New Price: $0." + tier.price.toString().padStart(2, '0'));

  const tx = await presale.setPricing(tier.price, 30);
  await tx.wait();

  console.log("\n✅ UPDATED! TX:", tx.hash);
}

main().catch(console.error);
