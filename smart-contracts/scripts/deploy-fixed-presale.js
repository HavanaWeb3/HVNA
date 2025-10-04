const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying NEW presale with wallet:", deployer.address, "\n");

  // Contract addresses
  const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const CORRECT_GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"; // Correct NFT from .env
  const PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"; // Chainlink ETH/USD on Base

  // Phase timings (same as before)
  const genesisPhaseStart = Math.floor(Date.now() / 1000) - 86400; // Started yesterday
  const genesisPhaseEnd = genesisPhaseStart + (7 * 24 * 60 * 60); // 7 days
  const publicPhaseStart = genesisPhaseStart; // Public phase also live
  const publicPhaseEnd = publicPhaseStart + (30 * 24 * 60 * 60); // 30 days

  console.log("📋 DEPLOYMENT PARAMETERS:\n");
  console.log("   HVNA Token:", HVNA_TOKEN);
  console.log("   Genesis NFT:", CORRECT_GENESIS_NFT, "(✅ CORRECTED)");
  console.log("   Price Feed:", PRICE_FEED);
  console.log("   Genesis Phase:", new Date(genesisPhaseStart * 1000).toLocaleString(), "to", new Date(genesisPhaseEnd * 1000).toLocaleString());
  console.log("   Public Phase:", new Date(publicPhaseStart * 1000).toLocaleString(), "to", new Date(publicPhaseEnd * 1000).toLocaleString());

  console.log("\n🚀 Deploying TokenPreSaleBase contract...\n");

  const TokenPreSaleBase = await ethers.getContractFactory("TokenPreSaleBase");
  const presale = await TokenPreSaleBase.deploy(
    HVNA_TOKEN,
    CORRECT_GENESIS_NFT,
    PRICE_FEED,
    genesisPhaseStart,
    genesisPhaseEnd,
    publicPhaseStart,
    publicPhaseEnd
  );

  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();

  console.log("✅ NEW Presale deployed to:", presaleAddress);

  console.log("\n📝 NEXT STEPS:");
  console.log("   1. Transfer 25M HVNA tokens from old presale to new presale");
  console.log("   2. Activate the sale with toggleSale()");
  console.log("   3. Update phase to Public with updatePhase()");
  console.log("   4. Update website with new presale address:", presaleAddress);

  console.log("\n💾 Saving deployment info...");

  const fs = require('fs');
  const deploymentInfo = {
    network: "base",
    timestamp: new Date().toISOString(),
    hvnaToken: HVNA_TOKEN,
    genesisNFT: CORRECT_GENESIS_NFT,
    oldPresale: "0x00e59916fEb5995E5657c68c71929B2E28E100d0",
    newPresale: presaleAddress,
    priceFeed: PRICE_FEED,
    deployer: deployer.address
  };

  fs.writeFileSync(
    'deployment-presale-fixed.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment info saved to deployment-presale-fixed.json\n");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
