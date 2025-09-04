# Base Mainnet Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] Enhanced NFT contract ready
- [x] HVNA Token contract ready  
- [x] Deployment scripts prepared
- [x] Production widget ready
- [x] Testing completed on Sepolia

## 🔄 Current Step: Getting Base ETH

### You Need:
- **Amount**: ~0.015 ETH on Base mainnet (~$40-50)
- **Purpose**: Gas fees for contract deployment
- **Your Address**: 0x4844382d686CE775e095315C084d40cEd16d8Cf5

### Getting Base ETH Options:

#### Option 1: Bridge from Ethereum
- Go to: https://bridge.base.org
- Bridge: 0.02 ETH from Ethereum → Base
- Cost: ~$50 + bridge fees
- Time: 10-15 minutes

#### Option 2: Coinbase Direct
- Buy ETH on Coinbase
- Withdraw directly to Base network
- Cost: ~$50
- Time: Instant

#### Option 3: Cross-Chain Bridge
- Use: across.to, hop.exchange, or stargate.finance
- Bridge from: Polygon, Arbitrum, etc.
- Cost: Varies
- Time: 5-20 minutes

## 📋 Once You Have Base ETH:

### Step 1: Verify Balance
```bash
# Check your Base ETH balance
npx hardhat run scripts/checkBalance.js --network base
```

### Step 2: Deploy Contracts
```bash
# Deploy to Base mainnet
npx hardhat run scripts/deployToBase.js --network base
```

### Step 3: Update Widget
```javascript
// Change in HavanaWeb3-production.js
this.selectedNetwork = 'base'; // Switch from 'sepolia' to 'base'
```

### Step 4: Test Production
```bash
# Test the deployed contracts
npx hardhat run scripts/testProductionWidget.js --network base
```

## 🎯 Expected Results

### After Deployment:
```
Enhanced NFT Contract: 0x[NEW_BASE_ADDRESS]
HVNA Token Contract:   0x[NEW_BASE_ADDRESS]  
Network:               Base (Chain ID: 8453)
Cost:                  $2-5 total
Status:                ✅ Production Ready
```

### Widget Features:
- ✅ Real blockchain verification on Base
- ✅ Genesis NFT detection (30% discount)
- ✅ Tiered NFT discounts (10%, 20%, 30%)
- ✅ Token holder discounts (€150+, €250+, €500+)
- ✅ Fast 2-3 second confirmations
- ✅ Low user transaction costs ($0.10-0.50)

## ⚡ Ready Commands

### Check if Base network is configured:
```bash
npx hardhat run --network base scripts/checkNetwork.js
```

### Deploy when ready:
```bash
npx hardhat run scripts/deployToBase.js --network base
```

### Test deployment:
```bash  
npx hardhat run scripts/testProductionWidget.js --network base
```

## 🚨 Troubleshooting

### If deployment fails:
1. Check Base ETH balance
2. Verify network connection
3. Check gas price settings
4. Contact support if needed

### If widget doesn't work:
1. Verify contract addresses
2. Check network configuration
3. Test MetaMask Base connection
4. Review browser console errors

---

**Next Action**: Get Base ETH, then we deploy! 🚀