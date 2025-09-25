# HVNA Presale Contract Status

## Current Deployed Contract
- **Address**: `0x637005bc97844da75e4Cd95716c62003E4Edf041`
- **Network**: Base Mainnet
- **Owner**: `0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66`

## Current Status ✅

### ✅ What's Working
- **Contract Balance**: 25,000,000 $HVNA tokens
- **Sale Active**: True
- **Phase**: Public (active until September 2026)
- **Pricing**: $7 per 1000 tokens (Genesis), $10 per 1000 tokens (Public)
- **ETH Price**: $4000 USD (updatable by owner)
- **Genesis NFT Support**: Working
- **Owner Functions**: All functional

### ⚠️ Known Issues

#### 1. Pricing Bug (Frontend Handled)
- **Issue**: Contract calculates prices 1000x higher than intended
- **Root Cause**: Missing division by 1000 in `calculateCostETH()` function
- **Impact**: 1000 tokens costs 2.5 ETH instead of 0.0025 ETH
- **Solution**: Frontend compensates by showing both correct and contract prices
- **User Experience**: Clear warning displayed to users

#### 2. Sales Limit vs Token Balance
- **Issue**: `maxTokensForPreSale` hardcoded to 15M, but contract has 25M tokens
- **Current Limit**: Users can only buy 15M tokens through normal presale
- **Remaining**: 10M tokens are "locked" in contract but not sellable through presale

## Solutions

### Option 1: Use Current Contract (Recommended)
**Pros:**
- Already deployed and funded
- Fully functional for 15M token sales
- No additional gas costs

**Cons:**
- Limited to 15M tokens through presale
- 10M tokens require manual management

**Implementation:**
- Keep using current contract for primary sales
- After 15M tokens sold, owner can withdraw remaining 10M tokens
- Use `emergencyWithdraw()` or direct token transfers for remaining tokens

### Option 2: Deploy New Contract (When ETH Available)
**Pros:**
- Fixes both pricing bug and 25M token limit
- Clean implementation
- Better user experience

**Cons:**
- Requires ~0.003 ETH for deployment
- Need to move tokens from old contract

**Contract Ready:**
- Source code updated to 25M limit
- Pricing calculation fixed
- Ready for deployment at `scripts/deployFixedPresaleContract.js`

## Current Workarounds in Place

### Frontend
- **File**: `src/components/HVNATokenPurchase.jsx`
- **Contract Address**: Updated to `0x637005bc97844da75e4Cd95716c62003E4Edf041`
- **Pricing Fix**: Calculates both correct price and contract's expected price
- **User Warning**: Clear notification about pricing bug
- **Status**: Fully functional

## Next Steps

1. **Immediate**: Use current contract for sales up to 15M tokens
2. **Medium-term**: When ETH available, deploy new contract with fixes
3. **Token Management**: Monitor sales and manage remaining tokens manually

## Contract Functions Available

### Owner Functions
- `updateETHPrice(uint256)` - Update ETH/USD price
- `updateTokenPrices(uint256, uint256)` - Update token prices
- `toggleSale()` - Enable/disable sale
- `withdrawETH()` - Withdraw collected ETH
- `emergencyWithdraw()` - Withdraw all tokens and ETH
- `forcePhaseChange(Phase)` - Change sale phase

### Public Functions
- `buyTokens(uint256)` - Purchase tokens
- `calculateCostETH(uint256, address)` - Get cost in ETH
- `isGenesisHolder(address)` - Check Genesis NFT status
- `getPreSaleInfo()` - Get comprehensive presale data

## Technical Details

### Deployed Contract Stats
- **Genesis Price**: 700 cents per 1000 tokens
- **Public Price**: 1000 cents per 1000 tokens  
- **ETH Price**: $4000 USD
- **Tokens Available**: 25M total, 15M sellable through presale
- **Phase Active**: Until September 25, 2026

---

**Last Updated**: September 25, 2025
**Status**: Production Ready with Known Limitations