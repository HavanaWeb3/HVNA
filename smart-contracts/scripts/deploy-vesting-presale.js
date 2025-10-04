const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying VESTING presale with wallet:", deployer.address, "\n");

  // Contract addresses
  const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  const PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";

  // Phase timings (same as before)
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
  console.log("\n   📅 VESTING SCHEDULE:");
  console.log("   - 40% at trading launch (set by enableVesting())");
  console.log("   - 40% at +3 months");
  console.log("   - 20% at +6 months");

  console.log("\n🚀 Deploying TokenPreSaleVesting contract...\n");

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

  console.log("✅ VESTING Presale deployed to:", presaleAddress);

  console.log("\n📝 NEXT STEPS:");
  console.log("   1. Transfer 25M HVNA tokens to presale");
  console.log("   2. Activate sale with toggleSale()");
  console.log("   3. Update phase to Public with updatePhase()");
  console.log("   4. Update website with new presale address");
  console.log("\n   🔒 LATER (in 9+ months):");
  console.log("   5. Call enableVesting() when ready to start token distribution");
  console.log("   6. Buyers can claim 40% immediately");
  console.log("   7. Buyers can claim 40% more after 3 months");
  console.log("   8. Buyers can claim final 20% after 6 months");

  const fs = require('fs');
  const deploymentInfo = {
    network: "base",
    timestamp: new Date().toISOString(),
    hvnaToken: HVNA_TOKEN,
    genesisNFT: GENESIS_NFT,
    vestingPresale: presaleAddress,
    oldPresale: "0x90EB45B474Cf6f6449F553796464262ecCAC1023",
    priceFeed: PRICE_FEED,
    deployer: deployer.address,
    vestingSchedule: {
      first: "40% at launch",
      second: "40% at +3 months",
      third: "20% at +6 months"
    }
  };

  fs.writeFileSync(
    'deployment-vesting-presale.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment info saved to deployment-vesting-presale.json\n");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
