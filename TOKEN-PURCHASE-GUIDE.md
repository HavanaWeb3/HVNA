# 🚀 HVNA Token Purchase Implementation Guide

## Overview

Your HVNA token purchase system is **fully deployed and ready** on Base Network! This guide shows you how to integrate token purchases into your applications.

## 🎯 Quick Start

### 1. Ready-to-Use Demo
Open `token-purchase-demo.html` in your browser to see the complete purchase interface in action.

**Features:**
- ✅ Automatic Base network switching
- ✅ Genesis NFT holder verification
- ✅ 30% discount for Genesis holders
- ✅ Real-time price calculation
- ✅ Purchase validation
- ✅ Transaction confirmation
- ✅ Full error handling

### 2. Contract Addresses (Base Network)

```javascript
const HVNA_CONTRACTS = {
    tokenContract: '0x9B2c154C8B6B1826Df60c81033861891680EBFab',
    preSaleContract: '0x447dddB5115874698FCc3840e24Dc7EfE22deb3b', 
    genesisNFT: '0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642',
    discountManager: '0xdD75a7B5CD76Df246dc523a78fD284D8A2d390c2'
};
```

## 🔧 Integration Options

### Option 1: Complete HTML Interface
Use `token-purchase-demo.html` as a standalone purchase page:

```html
<!-- Embed in iframe or use directly -->
<iframe src="token-purchase-demo.html" width="100%" height="800px"></iframe>
```

### Option 2: JavaScript SDK
Use `frontend-integration/web3-auth-base.js` for custom integration:

```javascript
import { HavanaPreSaleAuthBase } from './web3-auth-base.js';

const purchase = new HavanaPreSaleAuthBase({
    preSaleAddress: '0x447dddB5115874698FCc3840e24Dc7EfE22deb3b',
    nftAddress: '0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642',
    tokenAddress: '0x9B2c154C8B6B1826Df60c81033861891680EBFab'
});

await purchase.init();
await purchase.connectWallet();

// Purchase 5,000 tokens
const result = await purchase.purchaseTokens(5000);
```

### Option 3: Web3 Direct Integration

```javascript
// Minimal direct integration
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(ABI, '0x447dddB5115874698FCc3840e24Dc7EfE22deb3b');

// Purchase tokens
const tokenAmount = web3.utils.toWei('5000', 'ether'); // 5,000 tokens
const transaction = await contract.methods.buyTokens(tokenAmount).send({
    from: userAccount,
    value: calculatedETHCost
});
```

## 📋 Pre-Sale Details

### Current Configuration
- **Phase**: Genesis (30 days) → Public (ongoing)
- **Token Price**: $0.01 USD (dynamic ETH conversion)
- **Genesis Discount**: 30% off ($0.007 USD)
- **Min Purchase**: 1,000 tokens
- **Max Purchase**: 25,000 (public) / 50,000 (Genesis) tokens

### Token Allocation
- **Total Pre-Sale**: 15,000,000 tokens (15% of supply)
- **Genesis Phase**: 5,000,000 tokens reserved
- **Public Phase**: 10,000,000 tokens
- **Remaining**: Automatically calculated

## 🔐 Authentication Flow

### Genesis NFT Verification
```javascript
// Check if user owns Genesis NFT
const isGenesis = await contract.methods.isGenesisHolder(userAddress).call();

// Get discount pricing
const price = await contract.methods.getCurrentPrice(userAddress).call();

// Genesis holders get 30% discount automatically
```

### Purchase Process
1. **Connect Wallet** → MetaMask/WalletConnect
2. **Switch Network** → Base mainnet (auto-prompt)
3. **Verify Genesis** → Check NFT ownership
4. **Calculate Price** → Real-time ETH/USD conversion
5. **Validate Purchase** → Min/max limits, remaining balance
6. **Execute Transaction** → On-chain purchase
7. **Confirm Success** → Update UI, show transaction hash

## 🎨 UI Components

### Status Display
```javascript
// Real-time user status
const status = {
    isGenesisHolder: true,
    currentPhase: 'Genesis',
    pricePerToken: '$0.007',
    tokensRemaining: '4,250,000',
    userPurchased: '10,000',
    purchaseLimit: '50,000'
};
```

### Purchase Form
- Token amount input (with validation)
- Auto-calculated ETH cost
- Auto-calculated USD cost
- Genesis discount indicator
- Purchase button with loading states
- Error/success messages

### Transaction Feedback
```javascript
// Success response
{
    success: true,
    transactionHash: '0x...',
    tokenAmount: 5000,
    ethCost: '0.015432',
    usdCost: '$35.00',
    blockExplorer: 'https://basescan.org/tx/0x...'
}
```

## ⚡ Base Network Integration

### Network Configuration
```javascript
const BASE_NETWORK = {
    chainId: '0x2105', // 8453 
    chainName: 'Base',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH', 
        decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org']
};
```

### Auto-Switch Network
```javascript
// Automatically switch users to Base network
await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x2105' }]
});
```

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first CSS design
- Touch-friendly buttons
- Responsive grid layouts
- Mobile MetaMask integration

### Progressive Web App Support
```javascript
// Add to homescreen functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
```

## 🔍 Testing

### Manual Testing Checklist
- [ ] MetaMask connection works
- [ ] Network switches to Base correctly  
- [ ] Genesis NFT detection works
- [ ] Price calculation is accurate
- [ ] Purchase limits are enforced
- [ ] Transaction completes successfully
- [ ] Error handling works properly
- [ ] Mobile interface is usable

### Test Accounts
Use Base testnet for development testing:
```javascript
// Switch to Base Sepolia for testing
const BASE_TESTNET = {
    chainId: '0x14A33', // 84531
    chainName: 'Base Sepolia',
    rpcUrls: ['https://sepolia.base.org']
};
```

## 🚨 Error Handling

### Common Issues
```javascript
// Handle common errors gracefully
const errorMessages = {
    4001: 'Transaction rejected by user',
    4902: 'Base network not added to MetaMask',
    -32603: 'Transaction failed - check gas/balance',
    'INSUFFICIENT_FUNDS': 'Not enough ETH for transaction',
    'EXCEEDS_LIMIT': 'Purchase exceeds your limit'
};
```

### User-Friendly Messages
- "Please install MetaMask to continue"
- "Switch to Base network to purchase tokens"
- "Genesis NFT detected - 30% discount applied!"
- "Transaction pending - please wait..."
- "Purchase successful! View on Basescan"

## 📊 Analytics Integration

### Track Purchase Events
```javascript
// Google Analytics example
gtag('event', 'token_purchase', {
    currency: 'USD',
    value: purchaseAmount,
    custom_parameters: {
        token_amount: tokenCount,
        is_genesis: isGenesisHolder,
        network: 'base'
    }
});
```

### Conversion Tracking
- Wallet connections
- Network switches
- Purchase attempts
- Successful transactions
- Error rates by type

## 🔧 Advanced Features

### Bulk Purchases
```javascript
// Allow purchasing for multiple wallets
const bulkPurchase = async (recipients, amounts) => {
    for (let i = 0; i < recipients.length; i++) {
        await contract.methods.buyTokensFor(recipients[i], amounts[i]).send();
    }
};
```

### Referral System
```javascript
// Track referral codes
const purchaseWithReferral = async (tokenAmount, referralCode) => {
    await contract.methods.buyTokensWithReferral(tokenAmount, referralCode).send();
};
```

### Subscription Model
```javascript
// Recurring purchases
const setupRecurringPurchase = async (tokenAmount, frequency) => {
    // Implement with subscription contract
};
```

## 🔐 Security Best Practices

### Input Validation
- Sanitize all user inputs
- Validate token amounts
- Check transaction parameters
- Verify contract addresses

### Transaction Security
- Use gas estimation + buffer
- Implement transaction timeouts
- Handle failed transactions gracefully
- Provide clear confirmation flows

### Smart Contract Interaction
- Always use the latest contract ABIs
- Verify contract addresses
- Handle contract method failures
- Implement proper error recovery

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All contracts deployed and verified
- [ ] Frontend integration tested
- [ ] Mobile experience optimized
- [ ] Error handling complete
- [ ] Analytics tracking implemented
- [ ] Documentation updated

### Launch Day
- [ ] Monitor transaction success rates
- [ ] Watch for network congestion
- [ ] Support users switching networks
- [ ] Handle high-volume traffic
- [ ] Update social media with progress

### Post-Launch
- [ ] Collect user feedback
- [ ] Monitor contract events
- [ ] Track conversion metrics
- [ ] Optimize gas costs
- [ ] Plan next phase features

## 📞 Support & Resources

### Documentation
- [Base Network Docs](https://docs.base.org/)
- [MetaMask Integration Guide](https://docs.metamask.io/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)

### Block Explorers
- **Base Mainnet**: https://basescan.org/
- **Contract Addresses**: View deployed contracts
- **Transaction History**: Track all purchases

### Community
- **Discord**: Get technical support
- **GitHub**: Report issues and contribute
- **Twitter**: Follow ecosystem updates

---

## ✅ Your Token Purchase System is Ready!

**Everything is deployed and working on Base Network.**

1. **Open** `token-purchase-demo.html` to test purchases
2. **Customize** the UI for your brand
3. **Integrate** using the provided JavaScript SDK
4. **Deploy** to your website
5. **Launch** your token sale!

The smart contracts are handling all the complex logic automatically:
- ✅ Genesis NFT verification
- ✅ Dynamic pricing with discounts
- ✅ Purchase limits and validation
- ✅ ETH/USD conversion via Chainlink
- ✅ Secure token transfers

**Ready to launch your token sale! 🚀**