/**
 * Test Script for Multi-Chain Presale Payments
 *
 * This script helps verify that the deployed presale contracts are working correctly
 * by testing various payment scenarios.
 *
 * Usage:
 *   # Test Ethereum deployment
 *   npx hardhat run scripts/test-presale-payments.js --network mainnet
 *
 *   # Test BSC deployment
 *   npx hardhat run scripts/test-presale-payments.js --network bsc
 *
 *   # Test Base deployment
 *   npx hardhat run scripts/test-presale-payments.js --network base
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing Multi-Chain Presale Contract\n");

  // Get network info
  const network = hre.network.name;
  console.log("Network:", network);

  // Load deployment info
  let deploymentFile;
  if (network === "mainnet") {
    deploymentFile = "deployment-ethereum-presale.json";
  } else if (network === "bsc") {
    deploymentFile = "deployment-bsc-presale.json";
  } else if (network === "base") {
    deploymentFile = "deployment-base-final-fixed.json";
  } else {
    console.error("❌ Unknown network. Please specify --network mainnet, bsc, or base");
    process.exit(1);
  }

  const deploymentPath = path.join(__dirname, "..", deploymentFile);
  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please deploy the contract first using the appropriate deployment script.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log("Presale Contract:", deployment.presaleContract || deployment.presaleAddress);
  console.log();

  // Get contract instance
  const presaleAddress = deployment.presaleContract || deployment.presaleAddress;
  const TokenPreSaleMultiChain = await hre.ethers.getContractFactory("TokenPreSaleMultiChain");
  const presale = TokenPreSaleMultiChain.attach(presaleAddress);

  console.log("📊 Running Tests...\n");

  // Test 1: Get contract info
  console.log("Test 1: Get Contract Info");
  try {
    const info = await presale.getContractInfo();
    console.log("  ✅ Chain Name:", info.chain);
    console.log("  ✅ Tokens Sold:", hre.ethers.formatEther(info.sold));
    console.log("  ✅ Max Tokens:", hre.ethers.formatEther(info.maxTokens));
    console.log("  ✅ Token Price (USD cents):", info.currentPrice.toString());
    console.log("  ✅ Sale Active:", info.active);
    console.log("  ✅ Phase:", info.phase === 0 ? "GENESIS" : info.phase === 1 ? "PUBLIC" : "ENDED");
    console.log("  ✅ USDT Enabled:", info.usdtEnabled);
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 2: Check native token price
  console.log("Test 2: Get Native Token Price");
  try {
    const priceRaw = await presale.getNativeUSDPrice();
    const price = Number(priceRaw) / 1e8; // Chainlink uses 8 decimals
    console.log(`  ✅ Current Price: $${price.toFixed(2)} USD`);
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 3: Calculate token price in native currency
  console.log("Test 3: Calculate Token Price");
  try {
    const tokenPriceGenesis = await presale.getTokenPriceInNative(true);
    const tokenPricePublic = await presale.getTokenPriceInNative(false);
    console.log("  ✅ Price per token (Genesis):", hre.ethers.formatEther(tokenPriceGenesis), "ETH/BNB");
    console.log("  ✅ Price per token (Public):", hre.ethers.formatEther(tokenPricePublic), "ETH/BNB");
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 4: Calculate purchase cost for 1,000 tokens
  console.log("Test 4: Calculate Purchase Cost (1,000 tokens)");
  try {
    const tokenAmount = hre.ethers.parseEther("1000");
    const [costGenesis, usdCostGenesis] = await presale.calculatePurchaseCost(tokenAmount, true, false);
    const [costPublic, usdCostPublic] = await presale.calculatePurchaseCost(tokenAmount, false, false);

    console.log("  Genesis Holder:");
    console.log("    ✅ Cost:", hre.ethers.formatEther(costGenesis), "ETH/BNB");
    console.log("    ✅ USD Value: $" + usdCostGenesis.toString());

    console.log("  Public:");
    console.log("    ✅ Cost:", hre.ethers.formatEther(costPublic), "ETH/BNB");
    console.log("    ✅ USD Value: $" + usdCostPublic.toString());
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 5: Calculate USDT cost
  console.log("Test 5: Calculate USDT Cost (1,000 tokens)");
  try {
    const tokenAmount = hre.ethers.parseEther("1000");
    const [costGenesis, usdCostGenesis] = await presale.calculatePurchaseCost(tokenAmount, true, true);
    const [costPublic, usdCostPublic] = await presale.calculatePurchaseCost(tokenAmount, false, true);

    // BSC USDT uses 18 decimals, Ethereum/Base use 6
    const decimals = network === "bsc" ? 18 : 6;

    console.log("  Genesis Holder:");
    console.log(`    ✅ USDT Cost: ${Number(costGenesis) / (10 ** decimals)} USDT`);
    console.log("    ✅ USD Value: $" + usdCostGenesis.toString());

    console.log("  Public:");
    console.log(`    ✅ USDT Cost: ${Number(costPublic) / (10 ** decimals)} USDT`);
    console.log("    ✅ USD Value: $" + usdCostPublic.toString());
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 6: Check purchase limits
  console.log("Test 6: Check Purchase Limits");
  try {
    const minPurchase = await presale.minPurchase();
    const maxPurchaseGenesis = await presale.maxPurchaseGenesis();
    const maxPurchasePublic = await presale.maxPurchasePublic();

    console.log("  ✅ Minimum Purchase:", hre.ethers.formatEther(minPurchase), "tokens");
    console.log("  ✅ Max Purchase (Genesis):", hre.ethers.formatEther(maxPurchaseGenesis), "tokens");
    console.log("  ✅ Max Purchase (Public):", hre.ethers.formatEther(maxPurchasePublic), "tokens");
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 7: Check phase timing
  console.log("Test 7: Check Phase Timing");
  try {
    const currentPhase = await presale.currentPhase();
    const genesisStart = await presale.genesisPhaseStart();
    const genesisEnd = await presale.genesisPhaseEnd();
    const publicStart = await presale.publicPhaseStart();
    const publicEnd = await presale.publicPhaseEnd();

    console.log("  ✅ Current Phase:", currentPhase === 0 ? "GENESIS" : currentPhase === 1 ? "PUBLIC" : "ENDED");
    console.log("  ✅ Genesis Phase:", new Date(Number(genesisStart) * 1000).toISOString(), "to", new Date(Number(genesisEnd) * 1000).toISOString());
    console.log("  ✅ Public Phase:", new Date(Number(publicStart) * 1000).toISOString(), "to", new Date(Number(publicEnd) * 1000).toISOString());
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 8: Check vesting status
  console.log("Test 8: Check Vesting Status");
  try {
    const vestingEnabled = await presale.vestingEnabled();
    console.log("  ✅ Vesting Enabled:", vestingEnabled);

    if (vestingEnabled) {
      const vestingStartDate = await presale.vestingStartDate();
      console.log("  ✅ Vesting Start Date:", new Date(Number(vestingStartDate) * 1000).toISOString());
    }
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Test 9: Verify addresses
  console.log("Test 9: Verify Contract Addresses");
  try {
    const genesisNFT = await presale.genesisNFT();
    const usdtToken = await presale.usdtToken();
    const owner = await presale.owner();

    console.log("  ✅ Genesis NFT:", genesisNFT);
    console.log("  ✅ USDT Token:", usdtToken);
    console.log("  ✅ Owner:", owner);
  } catch (error) {
    console.log("  ❌ Failed:", error.message);
  }
  console.log();

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Tests Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log();
  console.log("📝 Next Steps:");
  console.log("1. Verify all values look correct");
  console.log("2. Test small purchase on mainnet");
  console.log("3. Monitor contract on block explorer");
  console.log();
  console.log("🔗 View Contract:");
  if (network === "mainnet") {
    console.log(`   https://etherscan.io/address/${presaleAddress}`);
  } else if (network === "bsc") {
    console.log(`   https://bscscan.com/address/${presaleAddress}`);
  } else if (network === "base") {
    console.log(`   https://basescan.org/address/${presaleAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  });
