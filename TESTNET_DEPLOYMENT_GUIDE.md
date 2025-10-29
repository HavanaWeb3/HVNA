# 🧪 Testnet Deployment Guide - FREE Testing

## 🎯 Overview

Test your multi-chain presale on testnets with **FREE tokens** before deploying to mainnet!

**Testnets:**
- ✅ **Sepolia** (Ethereum testnet) - Test ETH and USDT
- ✅ **BSC Testnet** - Test BNB and USDT
- ✅ **Base** (already live on mainnet)

**Cost:** 🆓 **100% FREE** - No real money needed!

---

## 📋 Step-by-Step Guide

### Step 1: Get FREE Testnet Tokens (5-10 minutes)

Your deployer wallet: **0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05**

#### Get Sepolia ETH (Ethereum Testnet)

**Option A: Alchemy Faucet (Recommended)**
1. Visit: https://sepoliafaucet.com
2. Sign in with Alchemy account (free)
3. Enter your address: `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`
4. Click "Send Me ETH"
5. You'll receive **0.5 Sepolia ETH** (plenty for deployment)

**Option B: Other Faucets**
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://sepolia-faucet.pk910.de
- https://faucet.quicknode.com/ethereum/sepolia

#### Get BSC Testnet BNB

**Official BSC Faucet:**
1. Visit: https://testnet.bnbchain.org/faucet-smart
2. Enter your address: `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`
3. Complete captcha
4. Click "Give me BNB"
5. You'll receive **0.1 tBNB** (testnet BNB)

**Alternative:**
- https://testnet.binance.org/faucet-smart

#### Verify You Received Tokens

Check your balance:
```bash
# Check Sepolia ETH
curl -X POST https://sepolia.infura.io/v3/demo \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05","latest"],"id":1}'

# Or use a block explorer:
# Sepolia: https://sepolia.etherscan.io/address/0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
# BSC Testnet: https://testnet.bscscan.com/address/0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
```

---

### Step 2: Deploy to Sepolia Testnet (5 minutes)

```bash
cd /Users/davidsime/hvna-ecosystem/smart-contracts

# Deploy to Sepolia
npx hardhat run scripts/deploy-presale-ethereum.js --network sepolia
```

**Expected Output:**
```
🚀 Deploying TokenPreSaleMultiChain to Ethereum Mainnet...
Deploying with account: 0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
Account balance: 0.5 ETH

✅ TokenPreSaleMultiChain deployed to: 0xYourSepoliaAddress
✅ Sale activated!
✅ USDT payments enabled!
💾 Deployment info saved to: deployment-ethereum-presale.json
```

**Save the contract address!** You'll need it for the next step.

---

### Step 3: Deploy to BSC Testnet (5 minutes)

```bash
# Deploy to BSC Testnet
npx hardhat run scripts/deploy-presale-bsc.js --network bscTestnet
```

**Expected Output:**
```
🚀 Deploying TokenPreSaleMultiChain to Binance Smart Chain...
Deploying with account: 0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
Account balance: 0.1 BNB

✅ TokenPreSaleMultiChain deployed to: 0xYourBSCTestnetAddress
✅ Sale activated!
✅ USDT payments enabled!
💾 Deployment info saved to: deployment-bsc-presale.json
```

---

### Step 4: Update Frontend Config (2 minutes)

Edit `/Users/davidsime/hvna-ecosystem/src/config/chains.js`:

```javascript
// TESTNET ADDRESSES - Update these after deployment
export const PRESALE_ADDRESSES = {
  [CHAIN_IDS.ETHEREUM]: "0xYourSepoliaAddress",  // From Step 2
  [CHAIN_IDS.BSC]: "0xYourBSCTestnetAddress",    // From Step 3
  [CHAIN_IDS.BASE]: "0x2cCE8fA9C5A369145319EB4906a47B319c639928", // Mainnet (keep as-is)

  // Testnet addresses
  [CHAIN_IDS.SEPOLIA]: "0xYourSepoliaAddress",
  [CHAIN_IDS.BSC_TESTNET]: "0xYourBSCTestnetAddress",
};

// Add testnet chain configs for testing
export const CHAIN_CONFIG = {
  // ... existing chains ...

  [CHAIN_IDS.SEPOLIA]: {
    id: CHAIN_IDS.SEPOLIA,
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    icon: "🔷",
    color: "#627EEA",
    paymentTokens: ["ETH"],
    avgGasFee: "FREE (Testnet)",
    gasFeeTier: "free",
    bestFor: "Testing"
  },

  [CHAIN_IDS.BSC_TESTNET]: {
    id: CHAIN_IDS.BSC_TESTNET,
    name: "BSC Testnet",
    shortName: "BSC Test",
    nativeCurrency: {
      name: "Test BNB",
      symbol: "tBNB",
      decimals: 18
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    icon: "🟡",
    color: "#F3BA2F",
    paymentTokens: ["BNB"],
    avgGasFee: "FREE (Testnet)",
    gasFeeTier: "free",
    bestFor: "Testing"
  }
};
```

---

### Step 5: Rebuild and Deploy Website (2 minutes)

```bash
cd /Users/davidsime/hvna-ecosystem

# Rebuild with testnet addresses
npm run build

# Commit and push
git add -A
git commit -m "Add testnet contracts for free testing

Deployed to:
- Sepolia: 0xYourSepoliaAddress
- BSC Testnet: 0xYourBSCTestnetAddress

Users can now test purchases on testnets with free tokens!

🚀 Generated with Claude Code (https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

### Step 6: Get Test USDT (Optional - for USDT testing)

If you want to test USDT payments:

**Sepolia USDT:**
- No official faucet
- Can deploy mock USDT or skip for now

**BSC Testnet USDT:**
- Use testnet USDT at: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`
- Or deploy your own mock USDT

---

## 🧪 Testing Your Deployment

### Test on Sepolia (Ethereum Testnet)

1. **Visit your website:** www.havanaelephant.com
2. **Connect MetaMask** to Sepolia testnet:
   - Click MetaMask → Networks → Add Network
   - Or switch to Sepolia if already added
3. **Select "Ethereum" network** in the UI
4. **Switch to Sepolia** when prompted
5. **Enter token amount** (e.g., 1,000 HVNA)
6. **Click "Buy" button**
7. **Confirm transaction** in MetaMask (free!)
8. **Wait for confirmation** (~15 seconds)

**Verify:**
- Check transaction on: https://sepolia.etherscan.io
- View contract: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

### Test on BSC Testnet

Same process, but:
1. **Select "BSC" network** in UI
2. **Switch to BSC Testnet** in MetaMask:
   - Network Name: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
   - Chain ID: 97
   - Currency Symbol: tBNB
   - Block Explorer: https://testnet.bscscan.com
3. **Test purchase** with testnet BNB

---

## 📊 Verify Deployments

### Test Contract Functions

```bash
cd /Users/davidsime/hvna-ecosystem/smart-contracts

# Test Sepolia deployment
npx hardhat run scripts/test-presale-payments.js --network sepolia

# Test BSC Testnet deployment
npx hardhat run scripts/test-presale-payments.js --network bscTestnet
```

**This will verify:**
- ✅ Contract deployed correctly
- ✅ Price feeds working
- ✅ Token prices calculated correctly
- ✅ Purchase limits set
- ✅ Sale is active

---

## 🎯 What to Test

### Essential Tests:

1. **Network Switching**
   - Can you switch between Sepolia and BSC Testnet?
   - Does wallet prompt appear correctly?

2. **Purchase Flow**
   - Can you enter token amount?
   - Does cost calculation work?
   - Can you complete purchase?
   - Do you get confirmation?

3. **Genesis NFT Discount** (if applicable)
   - Does 30% discount show?
   - Is discount applied correctly?

4. **Error Handling**
   - Try below minimum (999 tokens) - should fail
   - Try with insufficient balance - should fail
   - Switch networks mid-purchase - should warn

5. **UI/UX**
   - Is everything responsive?
   - Are loading states clear?
   - Do error messages make sense?

---

## 🐛 Troubleshooting

### "Insufficient funds" Error
- Get more testnet tokens from faucets
- Wait 24 hours and request again

### "Network not found"
- Manually add testnet to MetaMask
- Check RPC URLs are correct

### "Contract not found"
- Verify contract deployed: Check deployment JSON file
- Confirm address in chains.js matches deployed address

### Transaction Fails
- Check you have enough testnet tokens for gas
- Try increasing gas limit in MetaMask
- Verify contract is active (test script)

---

## 💰 Cost Comparison

| Phase | Cost | Time | Risk |
|-------|------|------|------|
| **Testnet (Current)** | 🆓 FREE | 30 min | Zero |
| **Mainnet** | $260 | 30 min | Live money |

**Recommendation:** Test thoroughly on testnets first!

---

## ✅ Success Checklist

Before moving to mainnet, verify:

- [ ] Deployed to Sepolia successfully
- [ ] Deployed to BSC Testnet successfully
- [ ] Can switch networks in UI
- [ ] Can complete test purchase on Sepolia
- [ ] Can complete test purchase on BSC Testnet
- [ ] Purchase tracking works
- [ ] Genesis discount applies (if testing)
- [ ] Vesting info displays correctly
- [ ] No errors in browser console
- [ ] Mobile experience works
- [ ] All loading states work
- [ ] Error messages are clear

---

## 🚀 Moving to Mainnet (Later)

When you're ready and have budget:

1. **Fund mainnet wallet:**
   - Send 0.05 ETH to deployer wallet
   - Send 0.1 BNB to deployer wallet

2. **Deploy to mainnets:**
   ```bash
   npx hardhat run scripts/deploy-presale-ethereum.js --network mainnet
   npx hardhat run scripts/deploy-presale-bsc.js --network bsc
   ```

3. **Update config with mainnet addresses**

4. **Test with small amounts first** ($10-20)

5. **Announce multi-chain support** 🎉

---

## 📞 Quick Reference

**Testnet Faucets:**
- Sepolia: https://sepoliafaucet.com
- BSC: https://testnet.bnbchain.org/faucet-smart

**Block Explorers:**
- Sepolia: https://sepolia.etherscan.io
- BSC Testnet: https://testnet.bscscan.com

**Your Deployer Address:**
```
0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
```

**Deploy Commands:**
```bash
# Sepolia
npx hardhat run scripts/deploy-presale-ethereum.js --network sepolia

# BSC Testnet
npx hardhat run scripts/deploy-presale-bsc.js --network bscTestnet

# Test
npx hardhat run scripts/test-presale-payments.js --network sepolia
npx hardhat run scripts/test-presale-payments.js --network bscTestnet
```

---

## 🎯 Next Steps

1. **Get testnet tokens** (5-10 min)
2. **Deploy to Sepolia** (5 min)
3. **Deploy to BSC Testnet** (5 min)
4. **Update config** (2 min)
5. **Rebuild & deploy website** (2 min)
6. **Test everything** (30 min)
7. **Deploy to mainnet when ready!** (when you have budget)

---

**Ready to get started?** Let me know when you have the testnet tokens and I'll help you deploy! 🚀

**Total Time:** ~1 hour
**Total Cost:** 🆓 $0.00
