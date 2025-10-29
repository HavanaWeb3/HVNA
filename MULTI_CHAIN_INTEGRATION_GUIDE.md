# Multi-Chain Payment Integration Guide for HVNA Token Presale

## 📋 Overview

This guide provides complete instructions for integrating multi-chain payment support into your HVNA token presale website at www.havanaelephant.com.

**Supported Networks:**
- ✅ **Ethereum Mainnet** - ETH and USDT payments
- ✅ **Binance Smart Chain (BSC)** - BNB and USDT payments
- ✅ **Base** - ETH and USDT payments (existing + USDT addition)

**Implementation Status:**
- ✅ Smart contracts created
- ✅ Deployment scripts ready
- ✅ UI components built
- ⏳ Integration with existing frontend (next step)
- ⏳ Backend event listeners (next step)
- ⏳ Testing and deployment (next step)

---

## 🏗️ Architecture Overview

### Smart Contract Layer
```
TokenPreSaleMultiChain.sol
├── Accepts ETH/BNB (native currency)
├── Accepts USDT (ERC-20/BEP-20)
├── Chainlink price feeds for accurate conversion
├── Vesting: 40% at launch, 40% at +3mo, 20% at +6mo
├── Genesis NFT holder discount (30% off)
└── Purchase limits: $10 min, $10,000 max
```

### Frontend Layer
```
src/
├── config/
│   └── chains.js                    # Multi-chain configuration
├── components/
│   ├── ChainSelector.jsx            # Network selection UI
│   ├── PaymentTokenSelector.jsx     # Token selection UI
│   └── HVNATokenPurchase.jsx        # Main purchase component (to be updated)
```

### Backend Layer (To Be Built)
```
Multi-chain event listeners → Unified database → Dashboard
```

---

## 🚀 Step-by-Step Integration

### Phase 1: Deploy Smart Contracts (Priority)

#### 1.1 Compile Contracts

```bash
cd /Users/davidsime/hvna-ecosystem/smart-contracts
npx hardhat compile
```

#### 1.2 Deploy to Ethereum Mainnet

**Prerequisites:**
- Sufficient ETH in deployer wallet for gas (~0.05 ETH)
- Infura or Alchemy API key configured in `.env`

```bash
# Set environment variables
export DEPLOYER_PRIVATE_KEY="your_private_key"
export INFURA_PROJECT_ID="your_infura_project_id"

# Deploy
npx hardhat run scripts/deploy-presale-ethereum.js --network mainnet
```

**Expected Output:**
```
🚀 Deploying TokenPreSaleMultiChain to Ethereum Mainnet...
✅ TokenPreSaleMultiChain deployed to: 0x...
✅ Sale activated!
✅ USDT payments enabled!
💾 Deployment info saved to: deployment-ethereum-presale.json
```

**Post-Deployment:**
1. Copy the contract address from `deployment-ethereum-presale.json`
2. Update `src/config/chains.js` → `PRESALE_ADDRESSES[CHAIN_IDS.ETHEREUM]`
3. Verify contract on Etherscan (command provided in output)

#### 1.3 Deploy to BSC

```bash
# Deploy to BSC
npx hardhat run scripts/deploy-presale-bsc.js --network bsc
```

**Post-Deployment:**
1. Copy contract address from `deployment-bsc-presale.json`
2. Update `src/config/chains.js` → `PRESALE_ADDRESSES[CHAIN_IDS.BSC]`
3. Verify contract on BscScan

#### 1.4 Update Base Contract (Optional - Add USDT Support)

The current Base presale contract only accepts ETH. To add USDT support:

**Option A:** Deploy new multi-chain contract to Base
```bash
# Create deployment script for Base (similar to Ethereum/BSC)
npx hardhat run scripts/deploy-presale-base.js --network base
```

**Option B:** Keep existing Base contract for ETH-only, use new contract for USDT

---

### Phase 2: Update Frontend

#### 2.1 Install Dependencies (if needed)

Check your `package.json` - you already have Ethers.js 6.15.0. No additional dependencies required!

#### 2.2 Update Contract Addresses

Edit `/Users/davidsime/hvna-ecosystem/src/config/chains.js`:

```javascript
// After deploying contracts, update these addresses:
export const PRESALE_ADDRESSES = {
  [CHAIN_IDS.ETHEREUM]: "0xYourEthereumPresaleAddress", // From deployment-ethereum-presale.json
  [CHAIN_IDS.BSC]: "0xYourBSCPresaleAddress",           // From deployment-bsc-presale.json
  [CHAIN_IDS.BASE]: "0x2cCE8fA9C5A369145319EB4906a47B319c639928", // Current Base presale
};
```

#### 2.3 Create Enhanced Purchase Component

Create `/Users/davidsime/hvna-ecosystem/src/components/HVNATokenPurchaseMultiChain.jsx`:

**Key Features to Implement:**
1. Import chain configuration and UI components
2. Add chain selection state management
3. Add payment token selection state management
4. Implement network switching logic
5. Add USDT approval flow
6. Update purchase functions for multi-chain
7. Add multi-chain event tracking

**Integration Points:**

```javascript
import ChainSelector from './ChainSelector.jsx'
import PaymentTokenSelector from './PaymentTokenSelector.jsx'
import {
  CHAIN_IDS,
  getPresaleAddress,
  getUSDTAddress,
  getChainName,
  toHexChainId,
  formatChainForWallet
} from '@/config/chains.js'

// State management
const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.BASE) // Default to Base
const [currentChainId, setCurrentChainId] = useState(null)
const [selectedToken, setSelectedToken] = useState('ETH')
const [usdtApproved, setUsdtApproved] = useState(false)

// Network switching function
const switchNetwork = async (chainId) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: toHexChainId(chainId) }],
    })
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [formatChainForWallet(chainId)]
      })
    }
  }
}

// USDT approval function
const approveUSDT = async () => {
  const usdtAddress = getUSDTAddress(selectedChainId)
  const presaleAddress = getPresaleAddress(selectedChainId)

  // ERC-20 approve function
  const approveSignature = "0x095ea7b3" // approve(address,uint256)
  const spenderParam = presaleAddress.slice(2).padStart(64, '0')
  const amountParam = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" // Max uint256

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: userAddress,
      to: usdtAddress,
      data: approveSignature + spenderParam + amountParam
    }]
  })

  // Wait for confirmation
  await waitForTransaction(txHash)
  setUsdtApproved(true)
}

// Purchase with USDT function
const purchaseWithUSDT = async (tokenAmount) => {
  const presaleAddress = getPresaleAddress(selectedChainId)
  const tokenAmountWei = `0x${Math.floor(parseFloat(tokenAmount) * Math.pow(10, 18)).toString(16)}`

  // buyTokensWithUSDT(uint256) signature
  const buyWithUSDTSignature = "0xYOURSIGNATURE" // Calculate from contract ABI
  const tokenParam = tokenAmountWei.slice(2).padStart(64, '0')

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: userAddress,
      to: presaleAddress,
      data: buyWithUSDTSignature + tokenParam,
      value: '0x0' // No ETH sent for USDT purchases
    }]
  })

  return txHash
}
```

#### 2.4 Replace Old Component

In `/Users/davidsime/hvna-ecosystem/src/App.jsx`:

```javascript
// OLD:
import HVNATokenPurchase from './components/HVNATokenPurchase.jsx'

// NEW:
import HVNATokenPurchaseMultiChain from './components/HVNATokenPurchaseMultiChain.jsx'

// Then use the new component
<HVNATokenPurchaseMultiChain />
```

---

### Phase 3: Testing

#### 3.1 Testnet Testing (Recommended First)

Deploy to testnets before mainnet:

```bash
# Sepolia (Ethereum testnet)
npx hardhat run scripts/deploy-presale-ethereum.js --network sepolia

# BSC Testnet
npx hardhat run scripts/deploy-presale-bsc.js --network bscTestnet
```

**Test Checklist:**
- [ ] Connect wallet to testnet
- [ ] Switch between networks
- [ ] Purchase with native token (ETH/BNB)
- [ ] Approve USDT spending
- [ ] Purchase with USDT
- [ ] Verify purchase is recorded on-chain
- [ ] Check Genesis NFT discount applies correctly
- [ ] Test purchase limits ($10 min, $10K max)
- [ ] Test transaction failure handling

#### 3.2 Mainnet Testing

Start with small amounts:

1. **Ethereum:** Test with 0.001 ETH purchase
2. **BSC:** Test with 0.01 BNB purchase
3. **USDT:** Test with $10 USDT purchase

**Monitoring:**
- Etherscan: https://etherscan.io/address/YOUR_CONTRACT_ADDRESS
- BscScan: https://bscscan.com/address/YOUR_CONTRACT_ADDRESS
- BaseScan: https://basescan.org/address/YOUR_CONTRACT_ADDRESS

---

### Phase 4: Backend Event Listeners (Future)

Create a Node.js service to monitor purchases across all chains:

```javascript
// /Users/davidsime/hvna-ecosystem/backend/event-listener.js

const { ethers } = require('ethers');

// Set up providers for each chain
const providers = {
  ethereum: new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_KEY'),
  bsc: new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org'),
  base: new ethers.JsonRpcProvider('https://mainnet.base.org')
};

// Set up contract interfaces
const presaleABI = [...]; // ABI from compiled contract

const contracts = {
  ethereum: new ethers.Contract(ETHEREUM_PRESALE_ADDRESS, presaleABI, providers.ethereum),
  bsc: new ethers.Contract(BSC_PRESALE_ADDRESS, presaleABI, providers.bsc),
  base: new ethers.Contract(BASE_PRESALE_ADDRESS, presaleABI, providers.base)
};

// Listen for TokensPurchased events
Object.entries(contracts).forEach(([chain, contract]) => {
  contract.on('TokensPurchased', (buyer, amount, cost, costUSD, phase, isGenesis, paymentToken, event) => {
    console.log(`Purchase on ${chain}:`, {
      buyer,
      amount: ethers.formatEther(amount),
      paymentToken,
      costUSD,
      txHash: event.log.transactionHash
    });

    // Save to database
    savePurchaseToDatabase({
      chain,
      buyer,
      amount: ethers.formatEther(amount),
      paymentToken,
      costUSD,
      txHash: event.log.transactionHash,
      timestamp: Date.now()
    });
  });
});
```

---

## 📊 Contract ABIs

After compiling contracts, the ABI will be in:
```
/Users/davidsime/hvna-ecosystem/smart-contracts/artifacts/contracts/TokenPreSaleMultiChain.sol/TokenPreSaleMultiChain.json
```

Key function signatures you'll need:
- `buyTokens(uint256)` - Purchase with native currency
- `buyTokensWithUSDT(uint256)` - Purchase with USDT
- `tokensSold()` - Get total tokens sold
- `getPurchasedTokens(address)` - Get user's purchased tokens
- `getVestedAmount(address)` - Get user's vested tokens
- `claimTokens()` - Claim vested tokens (only on Base)

---

## 🔒 Security Checklist

Before going live:

- [ ] Contract audited (recommended)
- [ ] Test all payment flows on testnet
- [ ] Verify contract source code on block explorers
- [ ] Set up monitoring alerts for large purchases
- [ ] Test emergency pause functionality
- [ ] Verify price feed addresses are correct
- [ ] Test USDT approval limits (don't approve infinite)
- [ ] Set up multi-sig for owner functions (recommended)
- [ ] Test vesting claim functionality
- [ ] Backup all private keys securely

---

## 📱 User Experience Flow

### New User Journey:

1. **Visit Website** → See multi-chain options
2. **Select Network** → Choose Ethereum, BSC, or Base based on preferences
3. **Connect Wallet** → MetaMask or other Web3 wallet
4. **Switch Network** (if needed) → Wallet prompts to switch to selected network
5. **Select Payment Token** → ETH/BNB or USDT
6. **Approve USDT** (if using USDT) → One-time approval transaction
7. **Enter Token Amount** → Choose how many $HVNA to buy
8. **Confirm Purchase** → Sign transaction in wallet
9. **Purchase Confirmed** → Tokens allocated to vesting schedule
10. **Claim Tokens** (later) → On Base network after vesting periods unlock

---

## 🎯 Priority Action Items

**IMMEDIATE (Phase 1):**
1. ✅ Review smart contracts (done)
2. ✅ Review deployment scripts (done)
3. ✅ Review UI components (done)
4. ⏳ Deploy to Ethereum testnet (Sepolia)
5. ⏳ Deploy to BSC testnet
6. ⏳ Test all payment flows on testnet

**SHORT TERM (Phase 2):**
1. ⏳ Create full HVNATokenPurchaseMultiChain component
2. ⏳ Integrate with existing App.jsx
3. ⏳ Update chain configuration with deployed addresses
4. ⏳ Deploy to mainnet (Ethereum first, then BSC)
5. ⏳ Test with small amounts on mainnet

**MEDIUM TERM (Phase 3):**
1. ⏳ Build backend event listener service
2. ⏳ Create unified dashboard
3. ⏳ Set up monitoring and alerts
4. ⏳ Implement reconciliation system

---

## 💰 Cost Estimates

### Deployment Costs:
- **Ethereum Mainnet:** ~0.03-0.05 ETH (~$120-200 at $4,000 ETH)
- **BSC:** ~0.05-0.1 BNB (~$30-60 at $600 BNB)
- **Base:** ~$2-5 (minimal gas fees)

### User Transaction Costs:
- **Ethereum:** $20-100 per transaction (high gas)
- **BSC:** $0.30-1 per transaction (low gas)
- **Base:** $0.50-2 per transaction (low gas)

---

## 🐛 Troubleshooting

### Common Issues:

**1. "Insufficient ETH sent" error**
- Solution: Contract uses real-time Chainlink price feeds. Add 10% buffer to estimated cost.

**2. "USDT transfer failed" error**
- Solution: Ensure USDT approval is confirmed before purchase.

**3. "Genesis phase: Only NFT holders can participate" error**
- Solution: Check that Genesis NFT contract address is correct and user owns NFT.

**4. "Price feed too old" error**
- Solution: Chainlink feed may be stale. Wait a few minutes and retry.

**5. Network switching fails**
- Solution: User's wallet may not have the network added. Use `wallet_addEthereumChain`.

---

## 📞 Support & Resources

- **Smart Contracts:** `/Users/davidsime/hvna-ecosystem/smart-contracts/contracts/`
- **Deployment Scripts:** `/Users/davidsime/hvna-ecosystem/smart-contracts/scripts/`
- **UI Components:** `/Users/davidsime/hvna-ecosystem/src/components/`
- **Configuration:** `/Users/davidsime/hvna-ecosystem/src/config/chains.js`

**Chainlink Price Feeds:**
- Ethereum: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum
- BSC: https://docs.chain.link/data-feeds/price-feeds/addresses?network=bnb-chain
- Base: https://docs.chain.link/data-feeds/price-feeds/addresses?network=base

**Block Explorers:**
- Ethereum: https://etherscan.io
- BSC: https://bscscan.com
- Base: https://basescan.org

---

## ✅ Next Steps

1. **Review this guide thoroughly**
2. **Test contract compilation:** `npx hardhat compile`
3. **Deploy to testnet first** (Sepolia/BSC Testnet)
4. **Test all payment flows** on testnet
5. **Deploy to mainnet** (Ethereum → BSC → update Base)
6. **Update frontend** with deployed addresses
7. **Test on mainnet** with small amounts
8. **Monitor and iterate**

---

**Created:** October 29, 2025
**Status:** Implementation Ready
**Priority:** Deploy to Ethereum Mainnet First, then BSC
