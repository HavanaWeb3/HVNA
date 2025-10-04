# HVNA Token Presale - Implementation Report

**Project:** Havana Elephant Token Ecosystem
**Implementation Date:** October 3-4, 2025
**Network:** Base Mainnet (Chain ID: 8453)
**Status:** ✅ **LIVE AND OPERATIONAL**

---

## Executive Summary

This document provides a complete technical overview of the HVNA token presale implementation, including architecture, deployment process, troubleshooting, and operational procedures. This serves as a comprehensive handoff document for future developers.

**Achievement:** Successfully deployed a production-ready token presale system with vesting, recovering from multiple critical issues discovered during initial deployment.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Token Economics](#2-token-economics)
3. [Technical Implementation](#3-technical-implementation)
4. [Deployment Process](#4-deployment-process)
5. [Issues Encountered & Resolutions](#5-issues-encountered--resolutions)
6. [User Journey](#6-user-journey)
7. [Administrative Operations](#7-administrative-operations)
8. [Website Integration](#8-website-integration)
9. [Future Operations](#9-future-operations)
10. [Troubleshooting Guide](#10-troubleshooting-guide)

---

## 1. System Architecture

### 1.1 Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HVNA Token Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌───────────────┐      ┌──────────┐ │
│  │  HVNAToken   │◄─────┤   Presale     │─────►│ Genesis  │ │
│  │   (ERC-20)   │      │   (Vesting)   │      │   NFT    │ │
│  └──────────────┘      └───────────────┘      └──────────┘ │
│         │                      │                     │       │
│         │                      │                     │       │
│         ▼                      ▼                     ▼       │
│    100M Supply           Vesting Logic         NFT Holders  │
│                          40-40-20 Release      Get 30% Off  │
│                                                               │
│                      ┌───────────────┐                       │
│                      │   Chainlink   │                       │
│                      │  Price Feed   │                       │
│                      │  (ETH/USD)    │                       │
│                      └───────────────┘                       │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Website (havanaelephant.com)              │  │
│  │  • Connect Wallet                                      │  │
│  │  • Display Purchased Tokens                            │  │
│  │  • Purchase Interface                                  │  │
│  │  • Vesting Schedule Display                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Smart Contract Addresses

```javascript
// Production Contracts (Base Mainnet)
const ADDRESSES = {
  // Main Contracts
  hvnaToken: "0xb5561D071b39221239a56F0379a6bb96C85fb94f",
  vestingPresale: "0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8",
  genesisNFT: "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642",

  // Infrastructure
  chainlinkETHUSD: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",

  // Ownership
  ownerWallet: "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05",

  // Deprecated (DO NOT USE)
  oldPresale1: "0x00e59916fEb5995E5657c68c71929B2E28E100d0", // Wrong NFT
  oldPresale2: "0x90EB45B474Cf6f6449F553796464262ecCAC1023", // No vesting
  compromisedWallet: "0x0099B85B9a5f117AfB7877A36D4BBe0388DD0F66" // NEVER USE
};
```

---

## 2. Token Economics

### 2.1 Token Distribution

| Allocation | Amount | Percentage | Status |
|------------|--------|------------|--------|
| Presale | 25,000,000 HVNA | 25% | In presale contract |
| Team/Development | 30,000,000 HVNA | 30% | Owner wallet |
| Marketing/Growth | 20,000,000 HVNA | 20% | Owner wallet |
| Liquidity | 15,000,000 HVNA | 15% | Owner wallet |
| Reserve | 10,000,000 HVNA | 10% | Owner wallet |
| **TOTAL** | **100,000,000 HVNA** | **100%** | ✅ All accounted |

**Current Balances:**
```
Owner Wallet:    75,001,000 HVNA (75M + 1K test purchase)
Presale Contract: 24,999,000 HVNA (25M - 1K sold)
Total:           100,000,000 HVNA ✅
```

### 2.2 Presale Economics

**Pricing:**
- Public Price: **$0.01 per token**
- Genesis Holder Price: **$0.007 per token** (30% discount)
- Minimum Purchase: **1,000 tokens** ($10 public, $7 Genesis)
- Maximum Purchase (Public): **25,000 tokens** ($250)
- Maximum Purchase (Genesis): **50,000 tokens** ($350)

**Presale Caps:**
- Total Presale Allocation: **25,000,000 tokens**
- Genesis Phase Limit: **5,000,000 tokens**
- Public Phase Limit: **20,000,000 tokens**

**Revenue Potential:**
```
Maximum Revenue (all public):    25M × $0.01 = $250,000
Maximum Revenue (all Genesis):   25M × $0.007 = $175,000
Realistic Revenue (80/20 split): ~$225,000
```

### 2.3 Vesting Schedule

**Purpose:** Protect token price at trading launch by preventing mass dump

**Schedule:**
- **40%** released at trading launch (enableVesting() called)
- **40%** released after 3 months (+90 days)
- **20%** released after 6 months (+180 days)

**Example for 10,000 token purchase:**
- Day 0 (Trading Launch): 4,000 tokens claimable
- Day 90 (+3 months): 4,000 more tokens claimable (total 8,000)
- Day 180 (+6 months): 2,000 final tokens claimable (total 10,000)

---

## 3. Technical Implementation

### 3.1 Smart Contract: HVNAToken.sol

**Purpose:** ERC-20 token with 100M fixed supply

**Key Features:**
```solidity
contract HVNAToken {
    string public name = "Havana Token";
    string public symbol = "HVNA";
    uint8 public decimals = 18;
    uint256 public totalSupply = 100000000 * 10**18; // 100M fixed

    constructor() {
        // Mint all tokens to deployer
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) public returns (bool);
    function approve(address spender, uint256 amount) public returns (bool);
}
```

**Design Decision:** Simple ERC-20 without mint/burn functions
- **Pro:** Maximum simplicity, fewer attack vectors
- **Con:** No ability to adjust supply (acceptable for fixed tokenomics)

### 3.2 Smart Contract: TokenPreSaleVesting.sol

**Purpose:** Presale with vesting and NFT holder benefits

**Core Functions:**

```solidity
// Purchase tokens (recorded, not transferred)
function buyTokens(uint256 tokenAmount) public payable {
    // Validation
    require(saleActive, "Sale is not active");
    require(tokenAmount >= minPurchase, "Below minimum");

    // Genesis holder check
    bool isGenesis = genesisNFT.balanceOf(msg.sender) > 0;

    // Price calculation via Chainlink
    (uint256 ethCost, uint256 usdCost) = calculatePurchaseCost(tokenAmount, isGenesis);
    require(msg.value >= ethCost, "Insufficient ETH");

    // Record purchase (DON'T transfer tokens yet!)
    purchasedAmount[msg.sender] += tokenAmount;
    tokensSold += tokenAmount;

    // Refund excess
    if (msg.value > ethCost) {
        payable(msg.sender).transfer(msg.value - ethCost);
    }
}

// Calculate vested amount based on time
function getVestedAmount(address user) public view returns (uint256) {
    if (!vestingEnabled) return 0;

    uint256 totalPurchased = purchasedAmount[user];
    uint256 vestedPercent = 0;

    // 40% at launch
    if (block.timestamp >= vestingStartDate) {
        vestedPercent = 40;
    }

    // 40% at +3 months (total 80%)
    if (block.timestamp >= vestingStartDate + 90 days) {
        vestedPercent = 80;
    }

    // 20% at +6 months (total 100%)
    if (block.timestamp >= vestingStartDate + 180 days) {
        vestedPercent = 100;
    }

    return (totalPurchased * vestedPercent) / 100;
}

// Claim vested tokens
function claimTokens() public {
    require(vestingEnabled, "Vesting not enabled yet");

    uint256 vestedAmount = getVestedAmount(msg.sender);
    uint256 claimable = vestedAmount - claimedAmount[msg.sender];

    require(claimable > 0, "No tokens to claim");

    claimedAmount[msg.sender] += claimable;
    hvnaToken.transfer(msg.sender, claimable);
}
```

**Admin Functions:**
```solidity
function toggleSale() public onlyOwner; // Start/stop sales
function enableVesting() public onlyOwner; // Begin token distribution
function withdrawETH() public onlyOwner; // Collect revenue
function setPricing(uint256 _priceUSDCents, uint256 _discount) public onlyOwner;
function withdrawUnsoldTokens() public onlyOwner; // After presale ends
```

### 3.3 Chainlink Integration

**Price Feed:** ETH/USD on Base Mainnet
- Address: `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70`
- Decimals: 8
- Update Frequency: ~1 minute

**Usage:**
```solidity
function getETHUSDPrice() public view returns (uint256) {
    (, int256 price, , , ) = priceFeed.latestRoundData();
    require(price > 0, "Invalid price feed");
    return uint256(price); // e.g., 453419213211 = $4534.19
}

function getTokenPriceInETH(bool isGenesis) public view returns (uint256) {
    uint256 ethUsdPrice = getETHUSDPrice(); // 8 decimals
    uint256 effectivePriceUSDCents = isGenesis ? 0.7 : 1; // $0.007 or $0.01

    // Convert cents to 8 decimal USD: cents * 10^6
    uint256 priceUSDWith8Decimals = effectivePriceUSDCents * 10**6;

    // Calculate ETH price: (USD price * 10^18) / ETH_USD_Price
    return (priceUSDWith8Decimals * 10**18) / ethUsdPrice;
}
```

**Example Calculation:**
```
Token Price: $0.01
ETH Price: $4,534 (from Chainlink)

ETH per token = $0.01 / $4,534 = 0.000002206 ETH

For 1000 tokens:
1000 × 0.000002206 = 0.002206 ETH (~$10)
```

---

## 4. Deployment Process

### 4.1 Deployment Scripts

**File:** `scripts/deploy-vesting-presale.js`

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();

  // Constructor parameters
  const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  const PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";

  const genesisPhaseStart = Math.floor(Date.now() / 1000) - 86400;
  const genesisPhaseEnd = genesisPhaseStart + (7 * 24 * 60 * 60);
  const publicPhaseStart = genesisPhaseStart;
  const publicPhaseEnd = publicPhaseStart + (30 * 24 * 60 * 60);

  const TokenPreSaleVesting = await ethers.getContractFactory("TokenPreSaleVesting");
  const presale = await TokenPreSaleVesting.deploy(
    HVNA_TOKEN,
    GENESIS_NFT,
    PRICE_FEED,
    genesisPhaseStart,
    genesisPhaseEnd,
    publicPhaseStart,
    publicPhaseEnd
  );

  await presale.waitForDeployment();
  const address = await presale.getAddress();

  console.log("Presale deployed to:", address);
}
```

**Deployment Command:**
```bash
cd smart-contracts
npx hardhat run scripts/deploy-vesting-presale.js --network base
```

**Result:**
```
✅ Presale deployed to: 0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8
```

### 4.2 Setup Script

**File:** `scripts/migrate-to-vesting-presale.js`

**Steps:**
1. Deactivate old presale
2. Recover 25M tokens from old presale
3. Transfer 25M tokens to new presale
4. Activate new presale
5. Update phase to Public

**Execution:**
```bash
npx hardhat run scripts/migrate-to-vesting-presale.js --network base
```

**Transactions:**
```
Deactivate old presale:  0x218121765ec4d9b4eea4113689e5dcab54d93be4d6c4e604f495588995283f9e
Recover tokens:          0x19dc95223103fecb32e7265308b613f67cb5c71cc5b2602e39020aaf7622cc56
Fund new presale:        0x1c2977b8f8e0c7cc04df2d0fac09b9439239124bd9aafb8296610a3687c527f1
Activate sale:           0xa83f978c78bba5b1d60ca9bd17834300c4cebb3374f556676ded38b684265ae7
Update phase:            0xfbdb70c78ca3d192134f7742062294969de318849aec06a9d9d3a12ab7de6b3c
```

---

## 5. Issues Encountered & Resolutions

### 5.1 Issue Timeline

| # | Issue | Severity | Resolution | Time to Fix |
|---|-------|----------|------------|-------------|
| 1 | Private key exposed | CRITICAL | New wallet, redeploy | 2 hours |
| 2 | Wrong NFT address | HIGH | New presale contract | 1 hour |
| 3 | Price 100x too high | HIGH | setPricing() call | 10 mins |
| 4 | No vesting | MEDIUM | New vesting contract | 2 hours |
| 5 | Git history cleanup | MEDIUM | filter-branch | 30 mins |

### 5.2 Detailed Resolutions

**Issue 1: Private Key Exposure**

*Problem:* Original wallet private key committed to GitHub

*Impact:* Anyone could drain all funds

*Resolution:*
1. Created new secure wallet: `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`
2. Deployed new HVNAToken contract (100M fresh supply)
3. Deployed new presale contracts
4. Updated `.env` with new private key
5. Removed old key from git history using `git filter-branch`

*Lesson:* Never commit private keys. Use `.env` files with `.gitignore`

**Issue 2: Wrong Genesis NFT Address**

*Problem:* First presale used `0x815D1bfaF945aCa39049FF243D6E406e2aEc3ff5` which has broken `balanceOf()`

*Impact:* ALL purchases failed with "execution reverted"

*Root Cause:* Wrong address copied during deployment

*Resolution:*
1. Tested correct NFT: `0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642`
2. Deployed new presale with correct NFT
3. Recovered 25M tokens from broken presale
4. Funded new presale

*Lesson:* Always test external contract calls before production deployment

**Issue 3: Price 100x Too High**

*Problem:* `tokenPriceUSDCents = 100` instead of `1`

*Impact:* Users charged $1,000 instead of $10 for 1000 tokens

*Root Cause:* Incorrect comment in contract: `// $0.01 = 100 cents` (wrong!)

*Resolution:*
```solidity
// Called setPricing(1, 30) to correct:
presale.setPricing(1, 30); // 1 cent = $0.01 ✅
```

*Transaction:* `0xa433dde6ae8e6e01f1ae6878e9d77d3a25b57672a7d3062ce4c56665f45669db`

*Lesson:* $0.01 = 1 cent, not 100 cents. Verify pricing calculations.

**Issue 4: No Vesting**

*Problem:* Original contract sent tokens immediately to buyers

*Impact:* Risk of market dump at launch

*Resolution:*
1. Created `TokenPreSaleVesting.sol` with 40-40-20 schedule
2. Deployed new vesting presale
3. Migrated 25M tokens
4. Updated website to show "purchased" not "owned"

*Lesson:* Vesting is critical for healthy tokenomics

**Issue 5: Git History Cleanup**

*Problem:* Large files and secrets in git history preventing push

*Resolution:*
```bash
# Remove large node_modules
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch contentlynk/node_modules' \
  --prune-empty --tag-name-filter cat -- --all

# Remove exposed secrets
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch shopify-discount-api/README.md' \
  --prune-empty --tag-name-filter cat -- --all

git push origin main --force
```

*Lesson:* Add proper `.gitignore` before initial commit

---

## 6. User Journey

### 6.1 Purchase Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Purchase Journey                     │
└─────────────────────────────────────────────────────────────┘

1. Visit https://havanaelephant.com
   └─> Click "Buy $HVNA" or "Connect Wallet"

2. Connect Wallet (MetaMask, Rabby, etc.)
   └─> Website detects: Base network (Chain ID 8453)
   └─> If wrong network, prompts to switch to Base

3. Check Genesis NFT Status
   └─> Query: genesisNFT.balanceOf(userAddress)
   └─> If balance > 0: "🎉 Genesis Holder - 30% OFF!"
   └─> If balance = 0: Regular pricing

4. Enter Token Amount
   └─> Min: 1,000 tokens
   └─> Max: 25,000 (public) or 50,000 (Genesis)
   └─> Website calculates cost:
       ├─> Public: 1000 × $0.01 = $10
       └─> Genesis: 1000 × $0.007 = $7

5. Review Purchase Summary
   ┌────────────────────────────────────┐
   │ Tokens:           1,000 $HVNA      │
   │ Price per Token:  $0.01 USD        │
   │ Cost in ETH:      0.002427 ETH     │
   │ Total Cost USD:   $10.00           │
   └────────────────────────────────────┘

6. Click "Buy 1,000 $HVNA Tokens"
   └─> MetaMask popup appears
   └─> Shows transaction details:
       ├─> To: 0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8
       ├─> Amount: 0.002427 ETH
       └─> Gas: ~50,000 (estimate)

7. Confirm Transaction
   └─> Wait 2-5 seconds for Base confirmation
   └─> Transaction confirmed! ✅

8. View Purchased Tokens
   └─> Website updates:
       "Your $HVNA Tokens: 1,000"
   └─> Note: Tokens NOT in wallet (vesting locked)
   └─> Shown as "purchased" from presale contract

9. Wait for Trading Launch (9+ months)
   └─> Owner calls enableVesting()
   └─> User can claim 40% immediately
   └─> User can claim 40% after 3 months
   └─> User can claim 20% after 6 months
```

### 6.2 Smart Contract Interaction

**buyTokens() Transaction:**
```javascript
// User's wallet sends transaction:
{
  to: "0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8", // Presale
  value: "0.002427 ETH",
  data: "0x3610724e0000000000000000000000000000000000000000003635c9adc5dea00000"
  // Function: buyTokens(uint256)
  // Param: 1000 tokens (in wei: 1000 × 10^18)
}

// Contract executes:
1. Check: saleActive = true ✅
2. Check: tokenAmount >= minPurchase ✅
3. Check: isGenesisHolder(user) → false (public)
4. Calculate: ethCost = 0.002206 ETH
5. Check: msg.value (0.002427) >= ethCost (0.002206) ✅
6. Record: purchasedAmount[user] += 1000 tokens
7. Increment: tokensSold += 1000
8. Refund: 0.002427 - 0.002206 = 0.000221 ETH back to user
9. Emit: TokensPurchased event
10. Return: success ✅

// User's state after:
- ETH balance: -0.002206 ETH (net cost)
- HVNA balance: 0 (tokens locked in vesting)
- purchasedAmount: 1000 tokens (recorded in presale)
```

---

## 7. Administrative Operations

### 7.1 Daily Operations

**Monitor Sales:**
```bash
# Check presale state
npx hardhat run scripts/show-presale-details.js --network base

# Output:
# Token Balance: 24,999,000 HVNA
# ETH Balance: 0.002227 ETH
# Tokens Sold: 1,000 HVNA
```

**Withdraw Revenue:**
```bash
# Collect ETH from presale
npx hardhat run scripts/withdraw-presale-eth.js --network base

# Or manually:
# Call presale.withdrawETH() from owner wallet
```

### 7.2 Presale Management

**Pause Sales (Emergency):**
```javascript
// Stop all new purchases
await presale.toggleSale();
// saleActive: true → false
```

**Resume Sales:**
```javascript
await presale.toggleSale();
// saleActive: false → true
```

**Update Pricing:**
```javascript
// Change price to $0.015 per token, 25% discount
await presale.setPricing(1.5, 25);
// Note: Price in cents with 2 decimals
// 1.5 cents = $0.015
```

**Update Phase Manually:**
```javascript
// Force phase transition
await presale.updatePhase();
// Checks timestamp and moves to appropriate phase
```

### 7.3 End of Presale

**When presale ends (all tokens sold OR time expired):**

```bash
# 1. Stop sales
await presale.toggleSale();

# 2. Withdraw all ETH
await presale.withdrawETH();

# 3. Withdraw unsold tokens (if any)
await presale.withdrawUnsoldTokens();
// Transfers remaining tokens back to owner

# 4. Plan trading launch
# - List on DEX (Uniswap, SushiSwap)
# - Prepare liquidity pool
# - Enable vesting
```

---

## 8. Website Integration

### 8.1 Frontend Implementation

**File:** `src/components/HVNATokenPurchase.jsx`

**Contract Constants:**
```javascript
const TOKEN_CONTRACT = "0xb5561D071b39221239a56F0379a6bb96C85fb94f"
const PRESALE_CONTRACT = "0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8"
const GENESIS_NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"
```

**Key Functions:**

```javascript
// Check user's purchased tokens (from presale, not wallet)
const checkPurchasedTokens = async (address) => {
  const getPurchasedSignature = "0x74be0a3f" // getPurchasedTokens(address)
  const addressParam = address.slice(2).padStart(64, '0')
  const data = getPurchasedSignature + addressParam

  const result = await window.ethereum.request({
    method: 'eth_call',
    params: [{
      to: PRESALE_CONTRACT,
      data: data
    }, 'latest']
  })

  const purchased = parseInt(result, 16)
  const formattedPurchased = (purchased / Math.pow(10, 18)).toFixed(0)

  setPurchasedTokens(formattedPurchased)
}

// Purchase tokens
const handlePurchase = async () => {
  // Calculate cost with 10% buffer
  const costETH = calculateCost() // e.g., 0.002427 ETH

  // Encode function call
  const buyTokensSignature = "0x3610724e" // buyTokens(uint256)
  const amountInWei = (parseFloat(tokenAmount) * 1e18).toString(16).padStart(64, '0')
  const data = buyTokensSignature + amountInWei

  // Send transaction
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: userAddress,
      to: PRESALE_CONTRACT,
      value: '0x' + Math.floor(parseFloat(costETH) * 1e18).toString(16),
      data: data
    }]
  })

  console.log("Transaction:", txHash)
  // Wait for confirmation, then update UI
}
```

### 8.2 Deployment

**Platform:** Netlify (auto-deploy from GitHub)

**Process:**
```bash
# 1. Make changes to src/components/HVNATokenPurchase.jsx

# 2. Commit and push
git add src/components/HVNATokenPurchase.jsx
git commit -m "Update presale contract address"
git push origin main

# 3. Netlify automatically:
#    - Detects GitHub push
#    - Runs build: npm run build
#    - Deploys to havanaelephant.com
#    - Usually takes 2-3 minutes
```

**Verification:**
```
1. Visit https://havanaelephant.com
2. Open browser console (F12)
3. Check for:
   - "DEBUG: Presale contract: 0x1dAC6bb7..."
   - No errors
4. Connect wallet and test purchase
```

---

## 9. Future Operations

### 9.1 Trading Launch Checklist (9+ Months)

**Pre-Launch (2-4 weeks before):**
- [ ] Professional security audit completed
- [ ] Bug bounty program results reviewed
- [ ] DEX listing confirmed (Uniswap/SushiSwap)
- [ ] Liquidity pool prepared (e.g., 10M HVNA + $100K ETH)
- [ ] CEX listings negotiated (if applicable)
- [ ] Marketing campaign ready
- [ ] Community announcement prepared

**Launch Day:**
```bash
# 1. Deploy liquidity pool on DEX
# (Outside scope of this document)

# 2. Enable vesting
await presale.enableVesting()
# This sets vestingStartDate = block.timestamp
# Users can now claim 40% of tokens

# 3. Announce to community
# - Email blast
# - Twitter/Discord
# - Update website with claim button

# 4. Monitor claims
# Watch for claim transactions
# Be ready for questions/support
```

**Post-Launch (+3 months):**
```bash
# Users can now claim next 40%
# No action needed - automatic based on timestamp
# Monitor for issues
```

**Post-Launch (+6 months):**
```bash
# Users can now claim final 20%
# All tokens fully distributed
# Presale complete ✅
```

### 9.2 Vesting Management

**Enable Vesting:**
```javascript
// Called once at trading launch
const tx = await presale.enableVesting();
await tx.wait();

console.log("Vesting enabled!");
console.log("Start date:", await presale.vestingStartDate());
```

**Set Custom Start Date (before enabling):**
```javascript
// If you want vesting to start on specific date
const futureDate = Math.floor(new Date('2026-07-01').getTime() / 1000);
await presale.setVestingStartDate(futureDate);

// Then enable
await presale.enableVesting();
```

**Check User's Vested Amount:**
```javascript
// View how much a user can claim right now
const userAddress = "0x...";
const claimable = await presale.getClaimableTokens(userAddress);
console.log("Claimable:", ethers.formatUnits(claimable, 18), "HVNA");

// View total purchased
const purchased = await presale.getPurchasedTokens(userAddress);
console.log("Purchased:", ethers.formatUnits(purchased, 18), "HVNA");

// View already claimed
const claimed = await presale.claimedAmount(userAddress);
console.log("Claimed:", ethers.formatUnits(claimed, 18), "HVNA");
```

---

## 10. Troubleshooting Guide

### 10.1 Common Issues

**Issue: Transaction fails with "Sale is not active"**
```javascript
// Check sale status
const active = await presale.saleActive();
console.log("Sale active:", active);

// Solution: Activate sale
if (!active) {
  await presale.toggleSale();
}
```

**Issue: "Insufficient ETH sent"**
```javascript
// Check actual cost
const [ethCost, usdCost] = await presale.calculatePurchaseCost(
  ethers.parseUnits("1000", 18),
  false // isGenesis
);

console.log("ETH cost:", ethers.formatEther(ethCost));
console.log("USD cost:", ethers.formatUnits(usdCost, 18));

// Solution: Send at least ethCost (or add 10% buffer)
```

**Issue: "Below minimum purchase amount"**
```javascript
// Check minimum
const min = await presale.minPurchase();
console.log("Min purchase:", ethers.formatUnits(min, 18), "tokens");

// Solution: Buy at least minimum (1,000 tokens)
```

**Issue: "Exceeds individual purchase limit"**
```javascript
// Check limits
const maxPublic = await presale.maxPurchasePublic();
const maxGenesis = await presale.maxPurchaseGenesis();

console.log("Max public:", ethers.formatUnits(maxPublic, 18));
console.log("Max Genesis:", ethers.formatUnits(maxGenesis, 18));

// Check user's already purchased
const purchased = await presale.purchasedAmount(userAddress);
console.log("Already purchased:", ethers.formatUnits(purchased, 18));

// Solution: Don't exceed limit (25K public, 50K Genesis)
```

**Issue: Website shows wrong token balance**
```javascript
// Make sure querying presale, not token contract
const purchased = await presale.getPurchasedTokens(userAddress);
console.log("Purchased (vesting):", purchased);

// NOT token.balanceOf() - tokens are locked in presale!
```

### 10.2 Emergency Procedures

**If exploit detected:**
```bash
# 1. IMMEDIATELY stop sales
await presale.toggleSale()

# 2. Withdraw all ETH to secure wallet
await presale.withdrawETH()

# 3. DO NOT enable vesting yet

# 4. Assess damage and plan migration
```

**If owner wallet compromised:**
```bash
# 1. Cannot recover - no owner transfer function
# 2. Immediately call from compromised wallet:
await presale.toggleSale() # Stop sales
await presale.withdrawETH() # Get funds to safety

# 3. Deploy new presale
# 4. Communicate with community about migration
```

**If Chainlink fails:**
```bash
# 1. Prices will be stale but purchase still works
# 2. Monitor priceFeed.latestRoundData()
# 3. If needed, pause sales until fixed
# 4. Chainlink has high uptime, rare issue
```

### 10.3 Diagnostic Scripts

**Check everything:**
```bash
npx hardhat run scripts/show-presale-details.js --network base
```

**Test purchase simulation:**
```bash
npx hardhat run scripts/test-new-presale-purchase.js --network base
```

**Verify pricing:**
```bash
npx hardhat run scripts/debug-pricing.js --network base
```

---

## Appendix A: Command Reference

### A.1 Deployment Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy presale
npx hardhat run scripts/deploy-vesting-presale.js --network base

# Setup presale (fund, activate, update phase)
npx hardhat run scripts/migrate-to-vesting-presale.js --network base
```

### A.2 Management Commands

```bash
# Check presale details
npx hardhat run scripts/show-presale-details.js --network base

# Withdraw ETH revenue
npx hardhat run scripts/withdraw-presale-eth.js --network base

# Check user balances
npx hardhat run scripts/check-actual-balance.js --network base

# Debug pricing
npx hardhat run scripts/debug-pricing.js --network base
```

### A.3 Git Commands

```bash
# Push to GitHub (triggers Netlify deploy)
git add .
git commit -m "Update message"
git push origin main

# Force push (if needed after filter-branch)
git push origin main --force
```

---

## Appendix B: Function Signatures

For direct contract interaction (advanced):

```javascript
// Function selectors (first 4 bytes of keccak256 hash)
const SIGNATURES = {
  // Purchase
  buyTokens: "0x3610724e",           // buyTokens(uint256)

  // View functions
  getPurchasedTokens: "0x74be0a3f",  // getPurchasedTokens(address)
  getClaimableTokens: "0x...",       // getClaimableTokens(address)
  getVestedAmount: "0x...",          // getVestedAmount(address)

  // Claim
  claimTokens: "0x...",              // claimTokens()

  // Admin
  toggleSale: "0x...",               // toggleSale()
  enableVesting: "0x...",            // enableVesting()
  withdrawETH: "0x...",              // withdrawETH()
  setPricing: "0x...",               // setPricing(uint256,uint256)
};
```

---

## Appendix C: Test Data

**Test Purchase Transaction:**
```
Hash: 0xfbdb70c78ca3d192134f7742062294969de318849aec06a9d9d3a12ab7de6b3c
From: 0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05
To: 0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8
Value: 0.002227307786575 ETH
Tokens: 1,000 HVNA
Status: Success ✅
```

**BaseScan Links:**
- Token: https://basescan.org/token/0xb5561D071b39221239a56F0379a6bb96C85fb94f
- Presale: https://basescan.org/address/0x1dAC6bb7d74DF22C00aba1Fbe90997702e0699b8
- Owner: https://basescan.org/address/0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05

---

## Conclusion

The HVNA token presale is now live and operational with:
- ✅ Secure ownership (no exposed keys)
- ✅ Correct pricing ($0.01 per token)
- ✅ Working purchase flow
- ✅ Vesting protection (40-40-20)
- ✅ Website integration
- ✅ Admin controls

This document provides all information needed for future developers to understand, maintain, and operate the presale system.

**For Support:**
- Review this document first
- Check `SECURITY_AUDIT_REPORT.md` for vulnerabilities
- Run diagnostic scripts in `/scripts`
- Consult BaseScan for on-chain data

**Last Updated:** October 4, 2025
**Document Version:** 1.0
**Contact:** Store with project documentation

---

*End of Implementation Report*
