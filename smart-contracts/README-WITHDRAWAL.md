# HVNA Presale Fund Withdrawal Guide

## Quick Start

### 1. Check Balance
See how much ETH is in the contract:
```bash
cd ~/hvna-ecosystem/smart-contracts
node check-balance.js
```

### 2. Withdraw Funds
Transfer all ETH to your wallet:
```bash
node withdraw-funds.js
```

---

## Setup (First Time Only)

### Make sure your .env file has:
```
RABBY_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

**⚠️ SECURITY WARNING:**
- Never share your private key
- Never commit .env to git
- Keep backups in a safe place

---

## How It Works

### When Someone Buys Tokens:
1. ✅ Buyer sends ETH to contract
2. ✅ Contract records their token allocation
3. ✅ ETH stays in contract
4. ⏳ YOU manually withdraw when ready

### When You Withdraw:
1. Script checks contract balance
2. Calls `withdrawETH()` function
3. All ETH transfers to: `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`
4. Contract balance becomes 0

---

## Recommended Withdrawal Schedule

### Option 1: Daily (Active Campaign)
```bash
# Run every day at 9am
node withdraw-funds.js
```
**Pros:** Regular cash flow, minimize risk
**Cons:** Higher total gas costs

### Option 2: Weekly (Steady Campaign)
```bash
# Run every Monday
node withdraw-funds.js
```
**Pros:** Lower gas costs, less maintenance
**Cons:** Funds sit in contract longer

### Option 3: On-Demand (Manual)
```bash
# Run whenever you want
node check-balance.js  # Check first
node withdraw-funds.js # Then withdraw
```
**Pros:** Maximum control, lowest gas costs
**Cons:** Must remember to do it

### Option 4: Threshold-Based (Smart)
```bash
# Only withdraw when balance > 0.1 ETH
node check-balance.js
# If balance is high enough, then:
node withdraw-funds.js
```
**Pros:** Optimizes gas costs
**Cons:** Requires checking regularly

---

## Troubleshooting

### "RABBY_PRIVATE_KEY not found"
**Fix:** Add your private key to `.env` file:
```bash
echo "RABBY_PRIVATE_KEY=0xYOUR_KEY_HERE" >> .env
```

### "You are not the owner"
**Fix:** Make sure you're using the correct private key for:
- `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`

### "Insufficient funds for gas"
**Fix:** Add some ETH to your wallet for gas fees:
- Need: ~0.001-0.005 ETH for gas
- Buy ETH on Coinbase/Binance
- Bridge to Base network

### "Contract has no ETH"
**Fix:** Wait for purchases to accumulate:
```bash
node check-balance.js  # Check again later
```

---

## Security Best Practices

✅ **DO:**
- Keep private key in `.env` file
- Never share your private key
- Test with small amounts first
- Backup your `.env` file securely

❌ **DON'T:**
- Commit `.env` to git
- Share private key in screenshots
- Run scripts on untrusted computers
- Store private key unencrypted

---

## Gas Costs

### Typical withdrawal gas cost:
- **Gas used:** ~30,000 - 50,000 gas
- **Gas price:** ~0.001 gwei (Base is cheap!)
- **Total cost:** $0.10 - $0.50 per withdrawal

### Cost comparison:
- Daily withdrawals (30 days): ~$15/month
- Weekly withdrawals (4 times): ~$2/month
- Monthly withdrawals (1 time): ~$0.50/month

---

## Example Output

### Check Balance:
```
╔════════════════════════════════════════════════════════════╗
║        HVNA PRESALE CONTRACT BALANCE CHECK                 ║
╚════════════════════════════════════════════════════════════╝

🔌 Connecting to Base network...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 CONTRACT BALANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Contract:     0x390Bdc27F8488915AC5De3fCd43c695b41f452FA
   ETH Balance:  0.05 ETH
   USD Value:    ≈$175.00 (at $3500/ETH)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 0.05 ETH ready to withdraw!
   Run: node withdraw-funds.js
```

### Withdraw Funds:
```
╔════════════════════════════════════════════════════════════╗
║        HVNA PRESALE FUND WITHDRAWAL SCRIPT                 ║
╚════════════════════════════════════════════════════════════╝

🔌 Connecting to Base network...
✅ Connected to Base mainnet
📍 Your wallet: 0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05

📜 Connecting to presale contract...
✅ Ownership verified

💰 Checking contract balance...
   Contract balance: 0.05 ETH
   ≈ $175.00 USD (at $3500/ETH)

🚀 Initiating withdrawal...

📤 Transaction submitted!
   TX Hash: 0xabc123...
   View on Basescan: https://basescan.org/tx/0xabc123...

⏳ Waiting for confirmation...
✅ WITHDRAWAL SUCCESSFUL!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 WITHDRAWAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Withdrawn:        0.05 ETH
   Gas cost:         0.00003 ETH
   Net received:     0.04997 ETH
   Block:            39725000
   Gas used:         35000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Funds are now in your wallet!
```

---

## Support

If you have issues:
1. Check this README
2. Verify `.env` file is correct
3. Check Basescan for contract status
4. Make sure you have ETH for gas

---

**Happy withdrawing! 💰**
