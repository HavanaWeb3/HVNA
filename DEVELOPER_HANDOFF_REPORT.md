# HVNA Token Ecosystem - Developer Handoff Report

**Project:** Havana Elephant Web3 Ecosystem
**Last Updated:** October 4, 2025
**Network:** Base Mainnet (Chain ID: 8453)
**Status:** ✅ **PRODUCTION - LIVE**

---

## Executive Summary

This document serves as a complete handoff guide for any developer taking over the HVNA token presale and ecosystem. It includes all contract addresses, implementation details, known issues, and operational procedures.

**Current Production Status:**
- ✅ HVNA Token deployed and verified
- ✅ Vesting Presale V2 live with tiered pricing
- ✅ Genesis NFT collection active
- ✅ Website fully integrated
- ✅ Purchase migration completed
- ✅ Real-time progress tracking operational

---

## 1. Smart Contract Addresses

### 1.1 Production Contracts (ACTIVE)

```javascript
// COPY THESE ADDRESSES - CURRENT PRODUCTION SYSTEM
const PRODUCTION_ADDRESSES = {
  // Core Token & Presale
  hvnaToken: "0xb5561D071b39221239a56F0379a6bb96C85fb94f",
  vestingPresaleV2: "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B", // ⭐ CURRENT

  // NFT Collections
  genesisNFT: "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642",
  boldlyElephunky: "0x815D1bfaF945aCa39049FF243D6E406e2aEc3ff5",

  // Infrastructure
  chainlinkETHUSD: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",

  // Ownership
  ownerWallet: "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05"
};
```

### 1.2 Deprecated Contracts (DO NOT USE)

```javascript
// THESE ARE OLD - FOR REFERENCE ONLY
const DEPRECATED_ADDRESSES = {
  oldPresale1: "0x00e59916fEb5995E5657c68c71929B2E28E100d0", // Wrong NFT address
  oldPresale2: "0x90EB45B474Cf6f6449F553796464262ecCAC1023", // No vesting
  vestingPresaleV1: "0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8", // Replaced by V2

  // SECURITY WARNING - NEVER USE
  compromisedWallet: "0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66" // Private key exposed
};
```

---

## 2. System Architecture

### 2.1 Current Production Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                   HVNA Token Ecosystem V2                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌────────────────────┐   ┌───────────┐ │
│  │  HVNAToken   │◄─────┤  VestingPresaleV2  │──►│  Genesis  │ │
│  │   (ERC-20)   │      │  (Tiered Pricing)  │   │    NFT    │ │
│  └──────────────┘      └────────────────────┘   └───────────┘ │
│         │                        │                      │       │
│    100M Supply            25M Presale Supply      30% Discount │
│    75M Owner              Vesting 40-40-20        Auto-Applied │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Tiered Pricing System                        │  │
│  │  • Tier 1: 0-5M tokens    @ $0.01 ($0.007 Genesis)      │  │
│  │  • Tier 2: 5M-10M tokens  @ $0.05 ($0.035 Genesis)      │  │
│  │  • Tier 3: 10M-15M tokens @ $0.10 ($0.070 Genesis)      │  │
│  │  • Tier 4: 15M-20M tokens @ $0.15 ($0.105 Genesis)      │  │
│  │  • Tier 5: 20M-25M tokens @ $0.30 ($0.210 Genesis)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Website: havanaelephant.com                  │  │
│  │  ✅ Wallet Connection                                     │  │
│  │  ✅ Purchase Interface                                    │  │
│  │  ✅ Real-time Progress Bar                                │  │
│  │  ✅ Tiered Pricing Display                                │  │
│  │  ✅ Vesting Schedule Display                              │  │
│  │  ✅ NFT Discount Auto-Detection                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Tiered Pricing System

### 3.1 Price Tiers Overview

| Tier | Token Range | Standard Price | Genesis Price (30% off) | Script Command |
|------|-------------|----------------|-------------------------|----------------|
| 1 | 0 - 5M | $0.01 | $0.007 | `npx hardhat run scripts/update-price-tier.js --network base 1` |
| 2 | 5M - 10M | $0.05 | $0.035 | `npx hardhat run scripts/update-price-tier.js --network base 2` |
| 3 | 10M - 15M | $0.10 | $0.070 | `npx hardhat run scripts/update-price-tier.js --network base 3` |
| 4 | 15M - 20M | $0.15 | $0.105 | `npx hardhat run scripts/update-price-tier.js --network base 4` |
| 5 | 20M - 25M | $0.30 | $0.210 | `npx hardhat run scripts/update-price-tier.js --network base 5` |

### 3.2 Manual Price Update Procedure

**When to Update:**
When tokensSold crosses a tier threshold (5M, 10M, 15M, 20M)

**How to Update:**
```bash
# Example: Moving from Tier 1 to Tier 2 when 5M tokens sold
cd smart-contracts
npx hardhat run scripts/update-price-tier.js --network base 2

# Output shows:
# === UPDATING TO TIER 2 ===
# New Price: $0.05
# ✅ UPDATED! TX: 0x...
```

**Script Location:** `/smart-contracts/scripts/update-price-tier.js`

### 3.3 Checking Current Sales

```bash
# Check how many tokens have been sold
npx hardhat run scripts/test-purchase-on-v2.js --network base

# Output:
# Sale active: true
# Total sold: 1,000 HVNA
# Your purchase: 1,000 HVNA
```

---

## 4. Token Economics

### 4.1 Distribution

| Allocation | Amount | Percentage | Current Location |
|------------|--------|------------|------------------|
| Presale | 25,000,000 | 25% | VestingPresaleV2 contract |
| Owner/Development | 75,000,000 | 75% | Owner wallet (0x12ED...) |
| **Total Supply** | **100,000,000** | **100%** | — |

### 4.2 Vesting Schedule

All presale purchases vest on this schedule:
- **40%** unlocked at trading launch
- **40%** unlocked at +3 months
- **20%** unlocked at +6 months

---

## 5. Critical Migration History

### 5.1 Why We Have V2

**Timeline of Issues:**

1. **First Deployment** (`0x00e5...`) - October 3
   - ❌ Wrong Genesis NFT address
   - ❌ All purchases failed with reverts
   - ❌ Had to abandon

2. **Second Deployment** (`0x90EB...`) - October 3
   - ✅ Correct NFT address
   - ❌ No vesting functionality
   - ✅ 1,000 tokens purchased successfully
   - ❌ Had to upgrade for vesting

3. **Third Deployment V1** (`0x1dAC...`) - October 3
   - ✅ Vesting functionality
   - ✅ Correct NFT address
   - ⚠️ 1,000 tokens stuck in old presale
   - ❌ Needed migration

4. **Fourth Deployment V2** (`0x746c...`) - October 4
   - ✅ Added migratePurchase() function
   - ✅ Successfully migrated 1,000 tokens
   - ✅ Added tiered pricing
   - ✅ Production ready

### 5.2 Migration Code

The migration function added to V2:

```solidity
// Admin function to migrate purchases from old presale
function migratePurchase(address buyer, uint256 amount) public onlyOwner {
    require(amount > 0, "Amount must be greater than 0");
    purchasedAmount[buyer] += amount;
    tokensSold += amount;
}
```

**Migration Transaction:**
```bash
# Migrated 1,000 HVNA from old presale (0x90EB...)
# To: VestingPresaleV2 (0x746c...)
# Buyer: 0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
```

---

## 6. Website Integration

### 6.1 Current Features

**File:** `/src/components/HVNATokenPurchase.jsx`

**Key Features:**
1. **Wallet Connection** - MetaMask, Rabby, WalletConnect
2. **Genesis NFT Detection** - Automatic 30% discount
3. **Purchase Interface** - ETH or USD input
4. **Real-time Progress Bar** - Shows tokens sold / 25M target
5. **Tiered Pricing Display** - Visual representation of all 5 tiers
6. **Vesting Schedule Display** - Shows 40-40-20 unlock schedule

### 6.2 Key Constants in Code

```javascript
// Website code uses THESE addresses
const PRESALE_CONTRACT = "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B" // V2
const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f"
const GENESIS_NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"
const CHAINLINK_ETH_USD = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
```

### 6.3 Progress Bar Implementation

Reads directly from blockchain:

```javascript
const checkTokensSold = async () => {
  const tokensSoldSignature = "0xd96a094a" // tokensSold() function
  const result = await window.ethereum.request({
    method: 'eth_call',
    params: [{ to: PRESALE_CONTRACT, data: tokensSoldSignature }, 'latest']
  })
  const sold = parseInt(result, 16) / Math.pow(10, 18)
  const progress = (sold / 25000000) * 100
  setSaleProgress(progress)
}
```

---

## 7. Administrative Operations

### 7.1 Update Token Price (Manual Tier Change)

```bash
cd smart-contracts

# When sales reach 5M, move to Tier 2:
npx hardhat run scripts/update-price-tier.js --network base 2

# When sales reach 10M, move to Tier 3:
npx hardhat run scripts/update-price-tier.js --network base 3

# And so on...
```

### 7.2 Check Presale Status

```bash
# Test buyer's purchase and sale status
npx hardhat run scripts/test-purchase-on-v2.js --network base
```

### 7.3 Withdraw ETH from Presale

⚠️ **Only after presale ends**

```bash
npx hardhat run scripts/withdraw-presale-eth.js --network base
```

---

## 8. Security Considerations

### 8.1 CRITICAL: Compromised Wallet

**NEVER USE THIS WALLET:**
- Address: `0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66`
- Reason: Private key exposed in git history
- Status: All assets evacuated to secure wallet

**Website Protection:**
Frontend blocks this wallet from connecting:
```javascript
if (connectedWallet.toLowerCase() === '0x0099b85b9a5f117afb7877a36d4bbe0388dd0f66') {
  setPurchaseStatus('🚫 Compromised wallet! Use secure wallet.')
  return
}
```

### 8.2 Secure Wallet (Current Owner)

**Owner Wallet:** `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`
- Type: Rabby Wallet (hardware-backed)
- Holds: 75M HVNA + contract ownership
- Status: ✅ Secure

---

## 9. Known Issues & Resolutions

### 9.1 RESOLVED: Tokens Not Displaying

**Problem:** User purchased 1,000 tokens but website showed 0

**Cause:** Tokens purchased in old presale (0x90EB...), website pointing to new presale (0x746c...)

**Resolution:**
1. Deployed V2 with migratePurchase() function
2. Migrated 1,000 tokens to new contract
3. Website now shows correct balance

**Status:** ✅ FIXED - All purchases now display correctly

### 9.2 RESOLVED: Transaction Failures

**Problem:** All purchase transactions reverting

**Cause:** First presale had wrong Genesis NFT address hardcoded

**Resolution:** Deployed new presale with correct NFT address

**Status:** ✅ FIXED - Purchases working

### 9.3 RESOLVED: No Vesting

**Problem:** Second presale had no vesting schedule

**Cause:** Used wrong contract (fixed presale instead of vesting presale)

**Resolution:** Deployed VestingPresale with 40-40-20 schedule

**Status:** ✅ FIXED - Vesting operational

---

## 10. Testing & Verification

### 10.1 Test Purchase Flow

```bash
# 1. Connect wallet to https://havanaelephant.com
# 2. Scroll to "$HVNA Token Purchase" section
# 3. Click "Connect MetaMask"
# 4. Enter purchase amount (min $25)
# 5. Confirm transaction
# 6. Wait for confirmation
# 7. See "Purchased (Vesting): X $HVNA"
```

### 10.2 Verify on BaseScan

**Presale Contract:**
https://basescan.org/address/0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B

**Token Contract:**
https://basescan.org/address/0xb5561D071b39221239a56F0379a6bb96C85fb94f

### 10.3 Check User Holdings

```javascript
// Call this on blockchain:
purchasedAmount(userAddress)

// Or use script:
npx hardhat run scripts/test-purchase-on-v2.js --network base
```

---

## 11. Deployment Checklist

If you ever need to deploy a new version:

### Pre-Deployment
- [ ] Test on Base Sepolia testnet first
- [ ] Verify NFT address is correct
- [ ] Verify Chainlink price feed address
- [ ] Check vesting schedule implementation
- [ ] Add migration function if needed

### Deployment
- [ ] Compile contracts: `npx hardhat compile`
- [ ] Deploy to Base mainnet with verified addresses
- [ ] Verify contract on BaseScan
- [ ] Transfer 25M HVNA to presale contract
- [ ] Activate sale: `toggleSale()`
- [ ] Set initial pricing: `setPricing(1, 30)` // $0.01, 30% discount

### Post-Deployment
- [ ] Update website contract address
- [ ] Test purchase with small amount
- [ ] Verify Genesis discount works
- [ ] Check vesting display
- [ ] Monitor first few customer purchases
- [ ] Update this document with new address

---

## 12. File Locations

### Smart Contracts
```
/smart-contracts/
├── contracts/
│   ├── HVNAToken.sol
│   ├── TokenPreSaleVesting.sol
│   └── GenesisElephant.sol
├── scripts/
│   ├── update-price-tier.js          // Manual price updates
│   ├── test-purchase-on-v2.js        // Check purchase status
│   ├── withdraw-presale-eth.js       // Withdraw ETH (after sale)
│   └── fund-and-activate-presale.js  // Initial setup
└── hardhat.config.js
```

### Website
```
/src/
├── components/
│   ├── HVNATokenPurchase.jsx    // Main presale UI (CURRENT)
│   ├── BoldlyElephunkyPurchase.jsx
│   └── GenesisPurchase.jsx      // (removed - was duplicate)
└── App.jsx
```

### Documentation
```
/
├── DEVELOPER_HANDOFF_REPORT.md  // THIS FILE
├── SECURITY_AUDIT_REPORT.md     // Security details
└── PRESALE_IMPLEMENTATION_REPORT.md  // Original implementation
```

---

## 13. Support & Escalation

### If Purchases Stop Working

1. **Check contract status:**
   ```bash
   npx hardhat run scripts/test-purchase-on-v2.js --network base
   ```

2. **Verify sale is active:**
   Should show `saleActive: true`

3. **Check token balance in presale:**
   Should have tokens remaining from 25M allocation

4. **Check Chainlink price feed:**
   Verify ETH/USD price is updating

### If Website Shows Wrong Balance

1. **Verify user connected correct wallet**
2. **Check blockchain directly:**
   ```bash
   # Replace with buyer address
   cast call 0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B \
     "purchasedAmount(address)(uint256)" \
     0xBUYER_ADDRESS \
     --rpc-url https://mainnet.base.org
   ```

3. **Clear browser cache and reconnect wallet**

### Emergency Contacts

- **Owner Wallet:** 0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
- **Email:** nftchampion2024@gmail.com
- **BaseScan Contract:** https://basescan.org/address/0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B

---

## 14. Future Enhancements

### Planned Features
- [ ] Automatic tier pricing (when 5M sold, auto-update to next tier)
- [ ] Token claim interface (for vesting unlocks)
- [ ] Airdrop functionality for marketing
- [ ] Staking mechanism
- [ ] Governance voting

### ContentLynk Integration
- Platform in development: www.contentlynk.com
- Earnings calculator live: /earnings-calculator
- Future: HVNA token integration for creator payments

---

## 15. Quick Reference

### Most Common Commands

```bash
# Update to next price tier
cd smart-contracts
npx hardhat run scripts/update-price-tier.js --network base [1-5]

# Check sales status
npx hardhat run scripts/test-purchase-on-v2.js --network base

# Withdraw ETH (after presale ends)
npx hardhat run scripts/withdraw-presale-eth.js --network base
```

### Most Important Addresses

```
Presale:  0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B
Token:    0xb5561D071b39221239a56F0379a6bb96C85fb94f
Owner:    0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
```

### Website URLs

- **Production:** https://havanaelephant.com
- **Staging:** https://hvna-ecosystem.vercel.app
- **ContentLynk:** https://contentlynk.com

---

**End of Developer Handoff Report**

*Last Updated: October 4, 2025*
*Version: 2.0 (Tiered Pricing Implementation)*
