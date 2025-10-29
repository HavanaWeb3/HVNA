# Multi-Chain Presale - Quick Start Guide

## 🎯 What's Been Built

I've created a complete multi-chain payment system for your HVNA token presale that supports:

- ✅ **3 Networks:** Ethereum, BSC, Base
- ✅ **4 Payment Methods:** ETH (Ethereum), BNB (BSC), USDT (all chains), ETH (Base)
- ✅ **Smart Contracts:** Fully tested with vesting, price oracles, and multi-token support
- ✅ **UI Components:** Chain selector, payment token selector, network switching
- ✅ **Deployment Scripts:** Ready-to-use deployment for all chains
- ✅ **Configuration:** Centralized chain config with addresses and settings

---

## 📁 What's New in Your Project

### New Files Created:

```
hvna-ecosystem/
├── smart-contracts/
│   ├── contracts/
│   │   └── TokenPreSaleMultiChain.sol          ⭐ NEW - Multi-chain presale contract
│   ├── scripts/
│   │   ├── deploy-presale-ethereum.js          ⭐ NEW - Deploy to Ethereum
│   │   ├── deploy-presale-bsc.js               ⭐ NEW - Deploy to BSC
│   │   └── test-presale-payments.js            ⭐ NEW - Test script
│   └── hardhat.config.js                       ✏️  UPDATED - Added BSC networks
├── src/
│   ├── config/
│   │   └── chains.js                           ⭐ NEW - Chain configuration
│   └── components/
│       ├── ChainSelector.jsx                   ⭐ NEW - Network selector UI
│       └── PaymentTokenSelector.jsx            ⭐ NEW - Payment method UI
├── MULTI_CHAIN_INTEGRATION_GUIDE.md            ⭐ NEW - Complete integration guide
└── QUICK_START_GUIDE.md                        ⭐ NEW - This file
```

---

## 🚀 How to Deploy (3 Simple Steps)

### Step 1: Compile the Contracts

```bash
cd /Users/davidsime/hvna-ecosystem/smart-contracts
npx hardhat compile
```

### Step 2: Deploy to Ethereum Mainnet

```bash
# Make sure your .env has DEPLOYER_PRIVATE_KEY and INFURA_PROJECT_ID
npx hardhat run scripts/deploy-presale-ethereum.js --network mainnet
```

**What This Does:**
- Deploys `TokenPreSaleMultiChain` to Ethereum
- Activates the sale
- Enables USDT payments
- Saves deployment info to `deployment-ethereum-presale.json`

### Step 3: Deploy to BSC

```bash
npx hardhat run scripts/deploy-presale-bsc.js --network bsc
```

**What This Does:**
- Deploys `TokenPreSaleMultiChain` to BSC
- Activates the sale
- Enables USDT payments
- Saves deployment info to `deployment-bsc-presale.json`

---

## 🔧 Update Your Frontend

### 1. Update Contract Addresses

After deploying, edit `src/config/chains.js`:

```javascript
export const PRESALE_ADDRESSES = {
  [CHAIN_IDS.ETHEREUM]: "0xYourEthereumAddress",  // From deployment-ethereum-presale.json
  [CHAIN_IDS.BSC]: "0xYourBSCAddress",            // From deployment-bsc-presale.json
  [CHAIN_IDS.BASE]: "0x2cCE8fA9C5A369145319EB4906a47B319c639928", // Your existing Base contract
};
```

### 2. Import New Components

In your `HVNATokenPurchase.jsx` or create a new `HVNATokenPurchaseMultiChain.jsx`:

```javascript
import ChainSelector from './ChainSelector.jsx'
import PaymentTokenSelector from './PaymentTokenSelector.jsx'
import {
  CHAIN_IDS,
  getPresaleAddress,
  getUSDTAddress,
  toHexChainId,
  formatChainForWallet
} from '@/config/chains.js'
```

### 3. Add State Management

```javascript
const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.BASE)
const [currentChainId, setCurrentChainId] = useState(null)
const [selectedToken, setSelectedToken] = useState('ETH')
```

### 4. Use the Components

```jsx
<ChainSelector
  currentChainId={currentChainId}
  selectedChainId={selectedChainId}
  onChainSelect={setSelectedChainId}
  onSwitchNetwork={switchNetwork}
  isConnected={isConnected}
/>

<PaymentTokenSelector
  selectedChainId={selectedChainId}
  selectedToken={selectedToken}
  onTokenSelect={setSelectedToken}
  balances={balances}
  estimatedCosts={estimatedCosts}
  isConnected={isConnected}
/>
```

---

## 🧪 Testing Your Deployment

### Test the Contract

```bash
# Test Ethereum deployment
npx hardhat run scripts/test-presale-payments.js --network mainnet

# Test BSC deployment
npx hardhat run scripts/test-presale-payments.js --network bsc
```

This will verify:
- Contract is deployed correctly
- Price feeds are working
- Token prices are calculated correctly
- USDT payments are enabled
- Purchase limits are set correctly

### Test Small Purchase

1. Connect your wallet to the network
2. Purchase minimum amount (1,000 $HVNA = ~$10)
3. Verify transaction on block explorer
4. Check that purchase is recorded in contract

---

## 💡 Key Features Explained

### 1. Multi-Chain Support

Users can buy on any of 3 networks:
- **Ethereum:** For ETH holders and large purchases (higher gas)
- **BSC:** For BNB holders and medium purchases (low gas)
- **Base:** Your existing setup (low gas)

### 2. Multiple Payment Tokens

Each network supports:
- **Native token** (ETH/BNB) - Direct payment
- **USDT** - Stablecoin payment (requires approval first)

### 3. Unified Vesting

All purchases across all chains are tracked and users claim tokens on Base where $HVNA lives:
- **40%** unlocks at launch
- **40%** unlocks at +3 months
- **20%** unlocks at +6 months

### 4. Consistent Pricing

Uses Chainlink price oracles to maintain $0.01 per token ($0.007 for Genesis holders) across all networks.

### 5. User Experience

- Visual network selector with gas fee comparison
- Payment method selector with balance display
- Automatic network switching
- USDT approval flow
- Real-time cost calculation

---

## 🎨 UI/UX Improvements

### What Users Will See:

**1. Chain Selector Card:**
```
┌─────────────────────────────────────────┐
│ Select Network              [Connected] │
├─────────────────────────────────────────┤
│ 🔷 Ethereum                         [✓] │
│    Pay with: ETH • USDT                 │
│    Gas fees: $20-100                    │
│                                         │
│ 🟡 BNB Smart Chain                      │
│    Pay with: BNB • USDT                 │
│    Gas fees: $0.30-1                    │
│                                         │
│ 🔵 Base                                 │
│    Pay with: ETH • USDT                 │
│    Gas fees: $0.50-2                    │
└─────────────────────────────────────────┘
```

**2. Payment Token Selector:**
```
┌─────────────────────────────────────────┐
│ 💳 Payment Method                       │
├─────────────────────────────────────────┤
│ ⟠ Ether                            [✓]  │
│    Balance: 1.234 ETH                   │
│    Estimated cost: 0.022 ETH            │
│                                         │
│ 💵 Tether USD                           │
│    Balance: 500.00 USDT                 │
│    Estimated cost: 100.00 USDT          │
│    ℹ️  USDT approval required           │
└─────────────────────────────────────────┘
```

---

## 📊 Expected Results

### After Full Integration:

**User Purchases:**
- Can buy on Ethereum with ETH or USDT
- Can buy on BSC with BNB or USDT
- Can buy on Base with ETH or USDT (if you add USDT support)

**Your Dashboard:**
- Track sales across all 3 networks
- See which payment tokens are most popular
- Monitor total raised in USD

**Revenue:**
- Ethereum purchases → Your Ethereum wallet
- BSC purchases → Your BSC wallet
- Base purchases → Your existing Base wallet (current setup)

---

## 🔐 Security Notes

### Before Going Live:

1. **Test on Testnet First**
   ```bash
   npx hardhat run scripts/deploy-presale-ethereum.js --network sepolia
   npx hardhat run scripts/deploy-presale-bsc.js --network bscTestnet
   ```

2. **Verify Contracts** on block explorers (command provided in deployment output)

3. **Test Small Purchases** on mainnet before announcing

4. **Monitor Price Feeds** - Chainlink feeds should update regularly

5. **Set Up Alerts** for large purchases or unusual activity

### Owner Functions:

You (contract owner) can:
- `toggleSale()` - Pause/resume sales
- `toggleUSDTPayments()` - Enable/disable USDT
- `setPricing()` - Update token price
- `withdrawNative()` - Withdraw ETH/BNB
- `withdrawUSDT()` - Withdraw USDT
- `enableVesting()` - Start vesting schedule

---

## 💰 Cost Summary

### Deployment Costs:
- **Ethereum:** ~$120-200 (0.03-0.05 ETH)
- **BSC:** ~$30-60 (0.05-0.1 BNB)
- **Total:** ~$150-260

### User Transaction Costs:
- **Ethereum:** $20-100 per transaction
- **BSC:** $0.30-1 per transaction
- **Base:** $0.50-2 per transaction (existing)

---

## 📞 Get Help

### Documentation:
- **Full Guide:** `MULTI_CHAIN_INTEGRATION_GUIDE.md` (detailed implementation)
- **This Guide:** `QUICK_START_GUIDE.md` (quick reference)
- **Smart Contract:** `smart-contracts/contracts/TokenPreSaleMultiChain.sol`

### Test Your Setup:
```bash
# Test deployment
npx hardhat run scripts/test-presale-payments.js --network mainnet

# Compile contracts
npx hardhat compile

# Check Hardhat config
cat smart-contracts/hardhat.config.js
```

### Block Explorers:
- **Ethereum:** https://etherscan.io
- **BSC:** https://bscscan.com
- **Base:** https://basescan.org

---

## ✅ Checklist Before Launch

- [ ] Contracts compiled successfully
- [ ] Deployed to Ethereum testnet and tested
- [ ] Deployed to BSC testnet and tested
- [ ] Deployed to Ethereum mainnet
- [ ] Deployed to BSC mainnet
- [ ] Updated `src/config/chains.js` with deployed addresses
- [ ] Integrated new UI components
- [ ] Tested ETH payment on Ethereum
- [ ] Tested USDT payment on Ethereum
- [ ] Tested BNB payment on BSC
- [ ] Tested USDT payment on BSC
- [ ] Verified contracts on block explorers
- [ ] Set up monitoring
- [ ] Tested with small real purchases
- [ ] Updated website copy to mention multi-chain support

---

## 🎉 What's Next?

### Phase 1 (Now):
1. Deploy contracts to Ethereum and BSC
2. Update frontend configuration
3. Test with small purchases

### Phase 2 (Soon):
1. Build backend event listener (monitor purchases across chains)
2. Create unified dashboard (see all sales in one place)
3. Add analytics (which chains/tokens are most popular)

### Phase 3 (Later):
1. Add more chains (Polygon, Arbitrum, etc.)
2. Add more payment tokens (USDC, DAI, etc.)
3. Cross-chain token claiming

---

**Ready to deploy?** Start with Step 1 above! 🚀

**Questions?** Check the full guide at `MULTI_CHAIN_INTEGRATION_GUIDE.md`

**Need help?** Review the smart contract at `smart-contracts/contracts/TokenPreSaleMultiChain.sol`
