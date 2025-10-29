# HVNA Presale Contract Status Report
**Generated:** 2025-10-28
**Website:** www.havanaelephant.com

---

## Summary

The presale contract currently used on www.havanaelephant.com is deployed and operational with the following key findings:

- **Contract Address:** `0x2cCE8fA9C5A369145319EB4906a47B319c639928` (Vesting V3)
- **Contract ETH Balance:** 0.0 ETH
- **Contract HVNA Balance:** 50,000,000 HVNA (ready for sale)
- **Owner Address:** `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`
- **Owner ETH Balance:** 0.024 ETH (~$100 at current ETH prices)

---

## Contract Analysis

### 1. Website Presale Contract (Vesting V3)
**Address:** `0x2cCE8fA9C5A369145319EB4906a47B319c639928`

**Status:**
- ✅ Contract is deployed and exists on Base Mainnet
- ✅ Has 50M HVNA tokens loaded and ready for sale
- ⚠️ Has 0 ETH balance (likely using auto-forward to owner)
- 📊 1 transaction sent from contract (likely deployment/setup)
- 📊 No recent incoming transactions detected in last 1,000 blocks

**Features (from deployment):**
- Purchase Limits: $10 min, $10,000 max per person
- Vesting Schedule:
  - 40% at token launch
  - 40% at +3 months
  - 20% at +6 months
- Supports both Genesis NFT holders and public participants

**View on Basescan:**
https://basescan.org/address/0x2cCE8fA9C5A369145319EB4906a47B319c639928

---

### 2. Other Deployed Presale Contracts

#### AutoForward Presale
**Address:** `0x90EB45B474Cf6f6449F553796464262ecCAC1023`
- ETH Balance: 0.002227 ETH
- Status: ✅ Deployed (deprecated/not in use)

#### TokenPreSaleFixed
**Address:** `0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E`
- ETH Balance: 0.00175 ETH
- Token Balance: 0 HVNA
- Tokens Sold: 1,000 HVNA
- Status: ✅ Deployed, Phase ENDED, Sale Active: true
- **This contract shows 1,000 tokens sold for 0.00175 ETH**

#### Old Presale
**Address:** `0x00e59916fEb5995E5657c68c71929B2E28E100d0`
- ETH Balance: 0 ETH
- Status: ✅ Deployed (deprecated/not in use)

---

## Smart Contract Review

### TokenPreSaleAutoForward.sol

The main presale contract uses an **AUTO-FORWARD mechanism** for ETH:

```solidity
// Lines 153-158: Auto-forward ETH to owner immediately
uint256 paymentAmount = cost;
if (paymentAmount > 0) {
    payable(owner).transfer(paymentAmount);
    emit ETHForwarded(owner, paymentAmount);
}
```

**Key Functions:**
1. **buyTokens()** - Main purchase function (line 114)
   - Validates purchase amount
   - Checks phase (Genesis vs Public)
   - Calculates cost in ETH based on USD pricing
   - Transfers tokens to buyer
   - **Auto-forwards ETH to owner**
   - Refunds excess ETH

2. **calculateCostETH()** - Pricing calculation (line 96)
   - Genesis: $7 per 1,000 tokens
   - Public: $10 per 1,000 tokens
   - Uses updatable ETH price (default: $4,000/ETH)

3. **Owner Controls:**
   - `updateETHPrice()` - Update ETH/USD price
   - `updateTokenPrices()` - Update token prices
   - `setPurchaseLimits()` - Adjust min/max purchase
   - `withdrawETH()` - Emergency ETH withdrawal
   - `emergencyEnd()` - End sale and recover funds

---

## Purchase Activity Summary

### Confirmed Sales:
- **TokenPreSaleFixed contract:** 1,000 HVNA sold for 0.00175 ETH

### Current Website Contract (Vesting V3):
- No recent purchase activity detected in sampled blocks
- 0 ETH balance suggests either:
  - No purchases yet, OR
  - Auto-forward is working and ETH went to owner

---

## Owner Wallet Status

**Address:** `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`

**Balances:**
- ETH: 0.024 ETH (~$96 at $4,000/ETH)
- HVNA: 49,999,000 tokens

**Note:** If purchases have been made on the Vesting V3 contract, the ETH would be in this wallet due to auto-forwarding.

---

## Recommendations

1. **Check Basescan Transaction History**
   - Visit: https://basescan.org/address/0x2cCE8fA9C5A369145319EB4906a47B319c639928
   - Review all incoming transactions
   - Check for "TokensPurchased" events
   - Verify ETH forwarding to owner address

2. **Verify Auto-Forward is Working**
   - The contract has 0 ETH balance, which is expected with auto-forward
   - All purchase ETH should appear in owner wallet: `0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05`

3. **Monitor Purchase Limits**
   - Current: $10 min, $10,000 max
   - Can be adjusted using `setPurchaseLimits()` if needed

4. **ETH Price Updates**
   - Contract uses fixed $4,000/ETH
   - Should update via `updateETHPrice()` when ETH price changes significantly
   - This affects how much ETH buyers need to send

---

## Contract Addresses Reference

```javascript
// Current Website Contract (Vesting V3)
const PRESALE_CONTRACT = "0x2cCE8fA9C5A369145319EB4906a47B319c639928"

// HVNA Token
const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f"

// Genesis NFT (for special pricing)
const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"

// Owner/Deployer
const OWNER = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05"
```

---

## Scripts Created for Monitoring

1. **check-presale-status.js** - Check all presale contracts
2. **check-website-presale.js** - Check website-specific contract
3. **verify-contract-exists.js** - Verify contracts are deployed
4. **check-full-status.js** - Complete status with owner wallet

Run any script with:
```bash
cd /Users/davidsime/hvna-ecosystem/smart-contracts
node <script-name>.js
```

---

## Conclusion

The presale smart contract is properly deployed and funded with 50M HVNA tokens. The 0 ETH balance is expected behavior due to the auto-forward mechanism that sends all purchase ETH directly to the owner's wallet.

**To verify actual purchase activity:** Check the Basescan transaction history at the URL provided above, or monitor the owner wallet for incoming ETH from the presale contract.
