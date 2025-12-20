/**
 * HVNA Presale Balance Checker
 *
 * Quick script to check how much ETH is in the presale contract.
 *
 * Usage:
 *   node check-balance.js
 */

const { ethers } = require('ethers');

// Configuration
const PRESALE_CONTRACT_ADDRESS = '0x390Bdc27F8488915AC5De3fCd43c695b41f452FA';
const BASE_RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b';

async function checkBalance() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        HVNA PRESALE CONTRACT BALANCE CHECK                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);

    console.log('🔌 Connecting to Base network...\n');

    const balance = await provider.getBalance(PRESALE_CONTRACT_ADDRESS);
    const balanceInETH = ethers.utils.formatEther(balance);

    // Approximate USD value (you can fetch real price from an API)
    const ethPriceUSD = 3500;
    const balanceInUSD = (parseFloat(balanceInETH) * ethPriceUSD).toFixed(2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 CONTRACT BALANCE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Contract:     ${PRESALE_CONTRACT_ADDRESS}`);
    console.log(`   ETH Balance:  ${balanceInETH} ETH`);
    console.log(`   USD Value:    ≈$${balanceInUSD} (at $${ethPriceUSD}/ETH)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (balance.isZero()) {
      console.log('\n⚠️  Contract has no ETH.');
      console.log('   Funds will appear here as purchases are made.\n');
    } else {
      console.log(`\n✅ ${balanceInETH} ETH ready to withdraw!`);
      console.log('   Run: node withdraw-funds.js\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

checkBalance();
