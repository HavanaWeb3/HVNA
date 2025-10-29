/**
 * Deploy Multi-Chain Presale Contract to Ethereum Mainnet or Sepolia Testnet
 *
 * This script deploys the TokenPreSaleMultiChain contract to Ethereum mainnet
 * or Sepolia testnet with ETH and USDT payment support.
 *
 * Usage:
 *   # Deploy to mainnet
 *   npx hardhat run scripts/deploy-presale-ethereum.js --network mainnet
 *
 *   # Deploy to Sepolia testnet (FREE testing!)
 *   npx hardhat run scripts/deploy-presale-ethereum.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const isTestnet = network === "sepolia";

  console.log(`🚀 Deploying TokenPreSaleMultiChain to ${isTestnet ? "Sepolia Testnet" : "Ethereum Mainnet"}...\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Contract addresses - different for testnet vs mainnet
  const HVNA_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Not on Ethereum - tokens claimed on Base
  const GENESIS_NFT_ADDRESS = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"; // Assuming cross-chain NFT verification
  const ETH_USD_PRICE_FEED = isTestnet
    ? "0x694AA1769357215DE4FAC081bf1f309aDC325306" // Chainlink ETH/USD on Sepolia
    : "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Chainlink ETH/USD on Ethereum Mainnet
  const USDT_TOKEN_ADDRESS = isTestnet
    ? "0x0000000000000000000000000000000000000000" // No USDT on Sepolia (use mock or skip)
    : "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT on Ethereum (6 decimals)
  const CHAIN_NAME = isTestnet ? "Sepolia" : "Ethereum";

  // Phase timing (Unix timestamps)
  const now = Math.floor(Date.now() / 1000);
  const GENESIS_PHASE_START = now; // Start immediately
  const GENESIS_PHASE_END = now + (7 * 24 * 60 * 60); // 7 days
  const PUBLIC_PHASE_START = GENESIS_PHASE_END; // Starts after Genesis
  const PUBLIC_PHASE_END = PUBLIC_PHASE_START + (30 * 24 * 60 * 60); // 30 days

  console.log("📋 Contract Configuration:");
  console.log("  Chain Name:", CHAIN_NAME);
  console.log("  HVNA Token:", HVNA_TOKEN_ADDRESS, "(Not on this chain - tokens claimed on Base)");
  console.log("  Genesis NFT:", GENESIS_NFT_ADDRESS);
  console.log("  ETH/USD Feed:", ETH_USD_PRICE_FEED);
  console.log("  USDT Token:", USDT_TOKEN_ADDRESS);
  console.log("  Genesis Phase:", new Date(GENESIS_PHASE_START * 1000).toISOString(), "to", new Date(GENESIS_PHASE_END * 1000).toISOString());
  console.log("  Public Phase:", new Date(PUBLIC_PHASE_START * 1000).toISOString(), "to", new Date(PUBLIC_PHASE_END * 1000).toISOString());
  console.log();

  // Deploy contract
  console.log("📝 Deploying TokenPreSaleMultiChain contract...");
  const TokenPreSaleMultiChain = await hre.ethers.getContractFactory("TokenPreSaleMultiChain");

  const presale = await TokenPreSaleMultiChain.deploy(
    HVNA_TOKEN_ADDRESS,
    GENESIS_NFT_ADDRESS,
    ETH_USD_PRICE_FEED,
    USDT_TOKEN_ADDRESS,
    CHAIN_NAME,
    GENESIS_PHASE_START,
    GENESIS_PHASE_END,
    PUBLIC_PHASE_START,
    PUBLIC_PHASE_END
  );

  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();

  console.log("✅ TokenPreSaleMultiChain deployed to:", presaleAddress);
  console.log();

  // Activate sale
  console.log("🔓 Activating sale...");
  const activateTx = await presale.toggleSale();
  await activateTx.wait();
  console.log("✅ Sale activated!");

  // Enable USDT payments
  console.log("💵 Enabling USDT payments...");
  const enableUSDTTx = await presale.toggleUSDTPayments();
  await enableUSDTTx.wait();
  console.log("✅ USDT payments enabled!");
  console.log();

  // Get contract info
  const info = await presale.getContractInfo();
  console.log("📊 Contract Info:");
  console.log("  Chain:", info.chain);
  console.log("  Tokens Sold:", hre.ethers.formatEther(info.sold));
  console.log("  Max Tokens:", hre.ethers.formatEther(info.maxTokens));
  console.log("  Token Price (USD cents):", info.currentPrice.toString());
  console.log("  Sale Active:", info.active);
  console.log("  Phase:", info.phase === 0 ? "GENESIS" : info.phase === 1 ? "PUBLIC" : "ENDED");
  console.log("  USDT Enabled:", info.usdtEnabled);
  console.log();

  // Save deployment info
  const deploymentInfo = {
    network: isTestnet ? "sepolia" : "ethereum",
    chainId: isTestnet ? 11155111 : 1,
    chainName: CHAIN_NAME,
    presaleContract: presaleAddress,
    hvnaToken: HVNA_TOKEN_ADDRESS,
    genesisNFT: GENESIS_NFT_ADDRESS,
    ethUsdPriceFeed: ETH_USD_PRICE_FEED,
    usdtToken: USDT_TOKEN_ADDRESS,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    genesisPhaseStart: GENESIS_PHASE_START,
    genesisPhaseEnd: GENESIS_PHASE_END,
    publicPhaseStart: PUBLIC_PHASE_START,
    publicPhaseEnd: PUBLIC_PHASE_END,
    saleActive: true,
    usdtPaymentsEnabled: true
  };

  const deploymentPath = path.join(__dirname, "../deployment-ethereum-presale.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);
  console.log();

  console.log("🎉 Deployment complete!");
  console.log();
  console.log("📝 Next Steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network ${network} ${presaleAddress} "${HVNA_TOKEN_ADDRESS}" "${GENESIS_NFT_ADDRESS}" "${ETH_USD_PRICE_FEED}" "${USDT_TOKEN_ADDRESS}" "${CHAIN_NAME}" ${GENESIS_PHASE_START} ${GENESIS_PHASE_END} ${PUBLIC_PHASE_START} ${PUBLIC_PHASE_END}`);
  console.log("2. Update frontend with new contract address");
  console.log("3. Test purchases with small amounts first");
  console.log("4. Monitor contract at:", isTestnet ? `https://sepolia.etherscan.io/address/${presaleAddress}` : `https://etherscan.io/address/${presaleAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
