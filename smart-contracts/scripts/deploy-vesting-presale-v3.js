const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying VESTING presale V3 with wallet:", deployer.address, "\n");

  // Contract addresses
  const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  const PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";

  // Phase timings
  const genesisPhaseStart = Math.floor(Date.now() / 1000) - 86400;
  const genesisPhaseEnd = genesisPhaseStart + (7 * 24 * 60 * 60);
  const publicPhaseStart = genesisPhaseStart;
  const publicPhaseEnd = publicPhaseStart + (30 * 24 * 60 * 60);

  console.log("📋 DEPLOYMENT PARAMETERS:\n");
  console.log("   HVNA Token:", HVNA_TOKEN);
  console.log("   Genesis NFT:", GENESIS_NFT);
  console.log("   Price Feed:", PRICE_FEED);
  console.log("   Genesis Phase:", new Date(genesisPhaseStart * 1000).toLocaleString());
  console.log("   Public Phase:", new Date(publicPhaseStart * 1000).toLocaleString());
  console.log("\n   💰 PURCHASE LIMITS (V3 - Updated):");
  console.log("   - Minimum: 1,000 tokens ($10)");
  console.log("   - Maximum (Genesis): 1,000,000 tokens ($10,000)");
  console.log("   - Maximum (Public): 1,000,000 tokens ($10,000)");
  console.log("\n   ✨ NEW FEATURES:");
  console.log("   - setPurchaseLimits() - Owner can update limits anytime");
  console.log("   - migratePurchase() - Migrate purchases from V2");
  console.log("\n   📅 VESTING SCHEDULE:");
  console.log("   - 40% at trading launch (set by enableVesting())");
  console.log("   - 40% at +3 months");
  console.log("   - 20% at +6 months");

  console.log("\n🚀 Deploying TokenPreSaleVesting V3 contract...\n");

  const TokenPreSaleVesting = await ethers.getContractFactory("TokenPreSaleVesting");
  const presale = await TokenPreSaleVesting.deploy(
    HVNA_TOKEN,
    GENESIS_NFT,
    PRICE_FEED,
    genesisPhaseStart,
    genesisPhaseEnd,
    publicPhaseStart,
    publicPhaseEnd
  );

  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();

  console.log("✅ VESTING Presale V3 deployed to:", presaleAddress);

  console.log("\n📝 NEXT STEPS:");
  console.log("   1. Transfer 25M HVNA tokens to presale V3");
  console.log("   2. Migrate existing 1,000 token purchase from V2");
  console.log("   3. Activate sale with toggleSale()");
  console.log("   4. Update phase to Public with updatePhase()");
  console.log("   5. Update website with new presale address");
  console.log("\n   🔄 MIGRATION FROM V2:");
  console.log("   - V2 address: 0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B");
  console.log("   - Use migratePurchase() to move purchases");
  console.log("\n   🔒 LATER (in 9+ months):");
  console.log("   - Call enableVesting() when ready to start token distribution");
  console.log("   - Buyers can claim tokens on vesting schedule");

  const fs = require('fs');
  const deploymentInfo = {
    version: "V3",
    network: "base",
    timestamp: new Date().toISOString(),
    hvnaToken: HVNA_TOKEN,
    genesisNFT: GENESIS_NFT,
    vestingPresaleV3: presaleAddress,
    vestingPresaleV2: "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B",
    oldFixedPresale: "0x90EB45B474Cf6f6449F553796464262ecCAC1023",
    priceFeed: PRICE_FEED,
    deployer: deployer.address,
    purchaseLimits: {
      minimum: "1,000 tokens ($10)",
      maximumGenesis: "1,000,000 tokens ($10,000)",
      maximumPublic: "1,000,000 tokens ($10,000)",
      updatable: true
    },
    vestingSchedule: {
      first: "40% at launch",
      second: "40% at +3 months",
      third: "20% at +6 months"
    },
    newFeatures: [
      "setPurchaseLimits() - Update purchase limits",
      "migratePurchase() - Migrate purchases from V2"
    ]
  };

  fs.writeFileSync(
    'deployment-vesting-presale-v3.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment info saved to deployment-vesting-presale-v3.json\n");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
