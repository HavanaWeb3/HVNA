# HVNA Token Presale V3 Deployment

## 🎉 Deployment Summary

**Date:** October 7, 2025
**Network:** Base Mainnet
**Contract:** TokenPreSaleVesting V3
**Address:** `0x2cCE8fA9C5A369145319EB4906a47B319c639928`

## ✅ What Was Fixed

### Previous Issue (V2)
- **Minimum:** 1,000 tokens ($10) ✅
- **Maximum (Genesis):** 50,000 tokens ($500) ❌
- **Maximum (Public):** 25,000 tokens ($250) ❌
- **Limits:** Hardcoded, no flexibility ❌

### New Limits (V3)
- **Minimum:** 1,000 tokens ($10) ✅
- **Maximum (Genesis):** 1,000,000 tokens ($10,000) ✅
- **Maximum (Public):** 1,000,000 tokens ($10,000) ✅
- **Limits:** Updatable via `setPurchaseLimits()` ✅

## 🆕 New Features in V3

### 1. Flexible Purchase Limits
```solidity
function setPurchaseLimits(
    uint256 _minPurchase,
    uint256 _maxPurchaseGenesis,
    uint256 _maxPurchasePublic
) public onlyOwner
```
Owner can update purchase limits anytime without redeploying.

### 2. Purchase Migration Function
```solidity
function migratePurchase(address buyer, uint256 amount) public onlyOwner
```
Allows migrating purchase records from old contracts.

## 📊 Current State

- **Tokens Sold:** 2,000 HVNA (includes migrated purchase)
- **Sale Active:** ✅ Yes
- **Phase:** PUBLIC
- **Token Price:** $0.01 USD
- **Contract Balance:** 50,000,000 HVNA (ready for presale)

### Your Purchase
- **Amount:** 2,000 HVNA (1,000 from V2 + 1,000 from earlier migration)
- **Value:** $20.00 USD
- **Status:** Migrated to V3 ✅

## 🔗 Contract Addresses

| Contract | Address |
|----------|---------|
| HVNA Token | `0xb5561D071b39221239a56F0379a6bb96C85fb94f` |
| Presale V3 (Current) | `0x2cCE8fA9C5A369145319EB4906a47B319c639928` |
| Presale V2 (Deprecated) | `0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B` |
| Genesis NFT | `0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642` |
| Price Feed (ETH/USD) | `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70` |

## 🌐 Website Updates

The website has been updated to use V3:
- **File:** `src/components/HVNATokenPurchase.jsx`
- **Line 40:** Contract address updated to V3
- **Status:** Deployed to GitHub/Vercel ✅

## 🧪 Testing

Test the new limits:
```bash
npx hardhat run scripts/verify-v3-limits.js --network base
```

## 📝 How to Update Purchase Limits in Future

If you need to change limits (e.g., increase maximum to $20,000):

```javascript
// Example: Update max to $20,000 (2M tokens at $0.01)
const presale = await ethers.getContractAt(
  "TokenPreSaleVesting",
  "0x2cCE8fA9C5A369145319EB4906a47B319c639928"
);

const newMax = ethers.parseEther("2000000"); // 2M tokens = $20,000
await presale.setPurchaseLimits(
  ethers.parseEther("1000"),    // Min: 1,000 tokens
  newMax,                        // Max Genesis: 2M tokens
  newMax                         // Max Public: 2M tokens
);
```

## 🔐 Security Features

1. **Vesting Schedule:** 40% launch, 40% +3mo, 20% +6mo
2. **Owner-only functions:** All admin functions protected
3. **Purchase validation:** Enforces min/max limits on-chain
4. **Gas fee savings:** Deployed on Base L2 for low fees
5. **Chainlink price feed:** Real-time ETH/USD pricing

## 📱 User Experience Improvements

### Website Shows:
- ✅ Purchased tokens when wallet connects
- ✅ Tiered pricing structure (5 tiers)
- ✅ Progress bar showing % of 25M sold
- ✅ Prominent Base network notice with bridge link
- ✅ "Connect Wallet" instead of "Connect MetaMask"

### What Users See:
- Minimum purchase: 1,000 tokens ($10)
- Maximum purchase: 1,000,000 tokens ($10,000)
- Clear vesting schedule information
- Base network requirement with easy bridging

## 🎯 Next Steps

1. ✅ V3 deployed with correct limits
2. ✅ Existing purchase migrated
3. ✅ Website updated to V3
4. ✅ Sale activated
5. ⏳ Monitor sales and user feedback

## 🔄 Migration History

| Version | Address | Status | Notes |
|---------|---------|--------|-------|
| Fixed Presale | `0x90EB...1023` | Deprecated | Original fixed presale |
| Vesting V2 | `0x746c...8d5B` | Deprecated | Had $500 max limit |
| Vesting V3 | `0x2cCE...9928` | ✅ Active | Current with $10K max |

---

**View on BaseScan:** https://basescan.org/address/0x2cCE8fA9C5A369145319EB4906a47B319c639928
