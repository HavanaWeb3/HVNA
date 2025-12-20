/**
 * HVNA Presale Fund Withdrawal Script
 *
 * Withdraws all ETH from the presale contract to your wallet.
 *
 * Usage:
 *   node withdraw-funds.js
 *
 * Requirements:
 *   - RABBY_PRIVATE_KEY in .env file
 *   - Contract must have ETH balance
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const PRESALE_CONTRACT_ADDRESS = '0x390Bdc27F8488915AC5De3fCd43c695b41f452FA';
const BASE_RPC_URL = 'https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b';
const OWNER_ADDRESS = '0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05';

// Presale contract ABI (only the functions we need)
const PRESALE_ABI = [
  'function withdrawETH() public',
  'function owner() public view returns (address)'
];

async function withdrawFunds() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        HVNA PRESALE FUND WITHDRAWAL SCRIPT                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Check for private key
    if (!process.env.RABBY_PRIVATE_KEY) {
      console.error('❌ ERROR: RABBY_PRIVATE_KEY not found in .env file');
      console.log('\nPlease add your private key to the .env file:');
      console.log('RABBY_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE\n');
      process.exit(1);
    }

    // 2. Setup provider and wallet
    console.log('🔌 Connecting to Base network...');
    const provider = new ethers.providers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(process.env.RABBY_PRIVATE_KEY, provider);

    console.log('✅ Connected to Base mainnet');
    console.log(`📍 Your wallet: ${wallet.address}\n`);

    // 3. Verify wallet is the owner
    if (wallet.address.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
      console.error(`❌ ERROR: Private key does not match owner address!`);
      console.log(`   Expected: ${OWNER_ADDRESS}`);
      console.log(`   Got:      ${wallet.address}\n`);
      process.exit(1);
    }

    // 4. Connect to contract
    console.log('📜 Connecting to presale contract...');
    const presaleContract = new ethers.Contract(
      PRESALE_CONTRACT_ADDRESS,
      PRESALE_ABI,
      wallet
    );

    // 5. Verify ownership
    const contractOwner = await presaleContract.owner();
    if (contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.error('❌ ERROR: You are not the owner of this contract!');
      console.log(`   Contract owner: ${contractOwner}`);
      console.log(`   Your address:   ${wallet.address}\n`);
      process.exit(1);
    }

    console.log('✅ Ownership verified\n');

    // 6. Check contract balance
    console.log('💰 Checking contract balance...');
    const contractBalance = await provider.getBalance(PRESALE_CONTRACT_ADDRESS);
    const balanceInETH = ethers.utils.formatEther(contractBalance);

    console.log(`   Contract balance: ${balanceInETH} ETH`);

    if (contractBalance.isZero()) {
      console.log('\n⚠️  Contract has no ETH to withdraw.');
      console.log('   Wait for purchases to accumulate funds.\n');
      process.exit(0);
    }

    // Calculate USD value (approximate)
    const ethPriceUSD = 3500; // Update this with current price or fetch from API
    const balanceInUSD = (parseFloat(balanceInETH) * ethPriceUSD).toFixed(2);
    console.log(`   ≈ $${balanceInUSD} USD (at $${ethPriceUSD}/ETH)\n`);

    // 7. Get wallet balance before
    const walletBalanceBefore = await provider.getBalance(wallet.address);
    console.log('📊 Your wallet balance: ' + ethers.utils.formatEther(walletBalanceBefore) + ' ETH\n');

    // 8. Confirm withdrawal
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  CONFIRM WITHDRAWAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Amount:      ${balanceInETH} ETH`);
    console.log(`   Value:       ≈$${balanceInUSD} USD`);
    console.log(`   From:        ${PRESALE_CONTRACT_ADDRESS}`);
    console.log(`   To:          ${wallet.address}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Auto-confirm for now (you can add readline for manual confirmation if needed)
    console.log('🚀 Initiating withdrawal...\n');

    // 9. Execute withdrawal
    const tx = await presaleContract.withdrawETH();

    console.log('📤 Transaction submitted!');
    console.log(`   TX Hash: ${tx.hash}`);
    console.log(`   View on Basescan: https://basescan.org/tx/${tx.hash}\n`);

    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log('✅ WITHDRAWAL SUCCESSFUL!\n');

      // 10. Show final balances
      const walletBalanceAfter = await provider.getBalance(wallet.address);
      const received = walletBalanceAfter.sub(walletBalanceBefore);
      const receivedETH = ethers.utils.formatEther(received);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 WITHDRAWAL SUMMARY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Withdrawn:        ${balanceInETH} ETH`);
      console.log(`   Gas cost:         ${ethers.utils.formatEther(contractBalance.sub(received))} ETH`);
      console.log(`   Net received:     ${receivedETH} ETH`);
      console.log(`   Block:            ${receipt.blockNumber}`);
      console.log(`   Gas used:         ${receipt.gasUsed.toString()}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n✨ Funds are now in your wallet!\n');

    } else {
      console.log('❌ Transaction failed!\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('\n💡 You don\'t have enough ETH to pay for gas.');
      console.log('   Add some ETH to your wallet for gas fees.\n');
    } else if (error.code === 'CALL_EXCEPTION') {
      console.log('\n💡 The transaction would fail. Possible reasons:');
      console.log('   - You are not the contract owner');
      console.log('   - Contract has no ETH to withdraw\n');
    } else {
      console.log('\nFull error:', error);
    }

    process.exit(1);
  }
}

// Run the script
withdrawFunds();
