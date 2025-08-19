# Genesis Marketplace Smart Contract

This marketplace contract enables secure trading of Genesis Elephant NFTs with automated ETH ↔ NFT exchanges.

## Features

- ✅ **Secure Trading** - Trustless NFT ↔ ETH exchanges
- ✅ **Batch Operations** - List multiple NFTs at once
- ✅ **Fee Management** - 2.5% marketplace fee (adjustable)
- ✅ **Withdrawal System** - Secure payment handling
- ✅ **Owner Controls** - Update prices, unlist NFTs
- ✅ **Emergency Functions** - Emergency withdrawal for safety

## Quick Setup

### 1. Install Dependencies
```bash
cd /Users/davidsime/HVNA
npm install solc ethers @openzeppelin/contracts
```

### 2. Set Your Private Key
```bash
export PRIVATE_KEY="your_wallet_private_key_here"
```

### 3. Compile Contract
```bash
node contracts/compile.js
```

### 4. Deploy to Base
```bash
node contracts/deploy.js
```

## What Happens After Deployment

1. **Marketplace Contract Deployed** - Gets a new address on Base
2. **Your NFTs Listed** - Available NFTs get listed with prices
3. **Frontend Updated** - Website will use the new marketplace
4. **Ready for Sales** - Users can buy NFTs directly with ETH

## Required Next Steps

### A. Approve Marketplace Contract
Before users can buy, you need to approve the marketplace to transfer your NFTs:

```javascript
// Go to Basescan.org, find your NFT contract
// Call: setApprovalForAll(marketplaceAddress, true)
```

### B. Update Frontend
The website will be updated to use the marketplace contract instead of direct transfers.

## Contract Functions

### For Buyers
- `buyNFT(tokenId)` - Purchase an NFT with ETH
- `withdraw()` - Withdraw refunds if overpaid

### For Sellers (You)
- `listNFT(tokenId, price)` - List single NFT
- `batchListNFTs(tokenIds[], prices[])` - List multiple NFTs
- `updatePrice(tokenId, newPrice)` - Change NFT price
- `unlistNFT(tokenId)` - Remove from sale
- `withdraw()` - Withdraw sale proceeds

### For Owner (You)
- `updateMarketplaceFee(newFee)` - Adjust marketplace fee
- `emergencyWithdraw()` - Emergency fund withdrawal

## Security Features

- **ReentrancyGuard** - Prevents double-spending attacks
- **Access Control** - Owner-only administrative functions
- **Pull Payment Pattern** - Secure withdrawal system
- **Input Validation** - All parameters validated

## Gas Estimates

- Deploy Contract: ~2,000,000 gas (~$15-30)
- List Single NFT: ~50,000 gas (~$1-3)
- Buy NFT: ~150,000 gas (~$3-8)
- Batch List 10 NFTs: ~300,000 gas (~$6-15)

## Support

After deployment, I'll help you:
1. Verify contract on Basescan
2. Set up the approval transaction
3. Update your website frontend
4. Test the complete purchase flow

The marketplace will handle everything automatically - users pay ETH, get NFTs instantly!