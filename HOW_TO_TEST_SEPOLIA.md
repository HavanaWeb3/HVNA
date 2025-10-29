# 🧪 How to Test on Sepolia Testnet

## ✅ What's Live

Your multi-chain presale is now live on **Sepolia testnet** for FREE testing!

**Contract:** `0x770008bd750c230000D7f581a454c8eE437ab7F8`
**Explorer:** https://sepolia.etherscan.io/address/0x770008bd750c230000D7f581a454c8eE437ab7F8

---

## 🚀 Quick Test (5 minutes)

### Step 1: Add Sepolia to MetaMask

**Option A: Auto-Add (Recommended)**
1. Visit www.havanaelephant.com
2. Connect your wallet
3. Select "Sepolia Testnet" from the network selector
4. MetaMask will prompt you to add the network
5. Click "Approve" and "Switch Network"

**Option B: Manual Add**
1. Open MetaMask
2. Click the network dropdown at the top
3. Click "Add Network"
4. Enter these details:
   - **Network Name:** Sepolia Testnet
   - **RPC URL:** https://ethereum-sepolia-rpc.publicnode.com
   - **Chain ID:** 11155111
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.etherscan.io

---

### Step 2: Get Free Sepolia ETH

You already have some, but if you need more:

1. Visit: **https://sepoliafaucet.com**
2. Enter your wallet address
3. Get 0.5 Sepolia ETH (free!)

**Alternative faucets:**
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://sepolia-faucet.pk910.de

---

### Step 3: Test a Purchase

1. **Visit:** www.havanaelephant.com (wait 2-5 min for deployment)
2. **Connect wallet** (MetaMask)
3. **You'll see:** Network selector with "Sepolia Testnet" option
4. **Select:** "Sepolia Testnet" 🔷
5. **Switch network** when prompted
6. **Enter amount:** 1,000 $HVNA (minimum)
7. **Click:** "Buy 1,000 $HVNA Tokens with ETH"
8. **Confirm** in MetaMask (free gas!)
9. **Wait** ~15 seconds for confirmation
10. **Success!** 🎉

---

### Step 4: Verify Your Purchase

**On Website:**
- You should see "Purchased (Vesting): 1,000 $HVNA"
- Shows vesting schedule (40%/40%/20%)

**On Block Explorer:**
- View your transaction: https://sepolia.etherscan.io
- Search for your wallet address
- See the purchase transaction

**In Contract:**
```bash
cd /Users/davidsime/hvna-ecosystem/smart-contracts
npx hardhat run scripts/test-presale-payments.js --network sepolia
```

---

## 🎯 What to Test

### ✅ Essential Tests:

1. **Network Switching**
   - Does Sepolia appear in the network list?
   - Can you switch to Sepolia?
   - Does MetaMask prompt correctly?

2. **UI Updates**
   - Does balance show correctly?
   - Does cost calculation work?
   - Do loading states appear?

3. **Purchase Flow**
   - Can you enter token amount?
   - Does minimum (1,000) validation work?
   - Can you complete purchase?
   - Does confirmation appear?

4. **Error Handling**
   - Try 999 tokens (should fail - below minimum)
   - Try switching networks mid-purchase
   - Check error messages are clear

5. **Post-Purchase**
   - Does purchased amount display?
   - Does vesting info show?
   - Can you see transaction on Sepolia Etherscan?

---

## 💡 Test Scenarios

### Scenario 1: Basic Purchase
```
1. Connect wallet → Sepolia
2. Enter 1,000 tokens
3. Click Buy
4. Confirm MetaMask
5. ✅ Success
```

### Scenario 2: Network Mismatch
```
1. Connect wallet → Different network
2. Select Sepolia in UI
3. Try to buy
4. ❌ Should warn: "Please switch to Sepolia"
5. Click switch
6. ✅ Network switches
7. Complete purchase
```

### Scenario 3: Below Minimum
```
1. Connect wallet → Sepolia
2. Enter 500 tokens
3. Click Buy
4. ❌ Should show: "Minimum purchase is 1,000 $HVNA"
```

### Scenario 4: Genesis Discount (if you have Genesis NFT)
```
1. Connect wallet that owns Genesis NFT
2. Should show "Genesis NFT Holder - 30% Discount!"
3. Price should be $0.007 instead of $0.01
```

---

## 📊 Expected Behavior

### When Everything Works:

1. **Network Selector Shows:**
   - 🔷 Ethereum (disabled - not deployed yet)
   - 🟡 BSC (disabled - not deployed yet)
   - 🔵 Base (live - mainnet)
   - 🔷 **Sepolia Testnet** (live - testnet) ✅

2. **On Sepolia Purchase:**
   - Gas fee: FREE (testnet)
   - Transaction time: ~15 seconds
   - Cost: 0.0000X Sepolia ETH (essentially free)
   - Confirmation: Immediate

3. **After Purchase:**
   - Balance updates
   - Shows vesting tokens
   - Can verify on Sepolia Etherscan

---

## 🐛 Troubleshooting

### Website says "Sepolia not available"
- Clear browser cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Wait 5 minutes for deployment to finish

### Can't switch to Sepolia
- Manually add network to MetaMask (see Step 1)
- Make sure you have some Sepolia ETH

### Transaction fails
- Check you have enough Sepolia ETH for gas
- Try increasing gas limit in MetaMask
- Verify contract is active

### "Insufficient ETH" error
- Get more from faucet: https://sepoliafaucet.com
- Wait 24 hours if daily limit reached

---

## 📈 What This Proves

When testing works on Sepolia, it confirms:

- ✅ Smart contract works correctly
- ✅ Purchase flow is smooth
- ✅ Network switching works
- ✅ UI displays properly
- ✅ Vesting tracking works
- ✅ Ready for mainnet deployment

---

## 🎯 Next Steps

### After Testing Sepolia:

**Option A: Deploy BSC Testnet (also free)**
1. Get BSC Testnet BNB from: https://testnet.bnbchain.org/faucet-smart
2. I'll deploy the contract
3. Test BNB purchases

**Option B: Go Straight to Mainnet (costs $260)**
1. Fund your wallet with real ETH and BNB
2. Deploy to Ethereum and BSC mainnets
3. Go live with all 3 networks!

**Option C: Wait and Test More**
- Keep testing on Sepolia
- Invite friends to test
- Verify everything thoroughly
- Deploy mainnet when ready

---

## 💰 Cost Comparison

| Testing Phase | Cost | Risk |
|---------------|------|------|
| **Sepolia (now)** | 🆓 FREE | Zero |
| **BSC Testnet (next)** | 🆓 FREE | Zero |
| **Ethereum Mainnet** | $200 | Real money |
| **BSC Mainnet** | $60 | Real money |

**Recommendation:** Test thoroughly on testnets first! ✅

---

## 📞 Quick Reference

**Contract Address:**
```
0x770008bd750c230000D7f581a454c8eE437ab7F8
```

**Block Explorer:**
```
https://sepolia.etherscan.io/address/0x770008bd750c230000D7f581a454c8eE437ab7F8
```

**Get Testnet ETH:**
```
https://sepoliafaucet.com
```

**Your Website:**
```
www.havanaelephant.com
```

---

## 🎉 Success!

You now have:
- ✅ Multi-chain presale on Sepolia testnet
- ✅ FREE testing environment
- ✅ Full purchase functionality
- ✅ Professional UI with network switching
- ✅ Ready to test before spending real money

**Go test it out!** Visit www.havanaelephant.com and try a purchase on Sepolia! 🚀

---

**Questions?** Check the full guide at `TESTNET_DEPLOYMENT_GUIDE.md`
