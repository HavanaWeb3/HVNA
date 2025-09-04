# HVNA Discount System Summary
## Token + NFT Holder Benefits

---

## 🎯 Discount Structure

### **NFT Holders (Boldly Elephunky Collection)**
- 🥈 **Silver Elephant NFT**: 10% discount
- 🥇 **Gold Elephant NFT**: 25% discount  
- 💎 **Platinum Elephant NFT**: 50% discount

### **Token Holders (HVNA)**
- 🪙 **150+ EUR in HVNA tokens**: 10% discount
- Perfect for users who buy tokens but haven't minted NFTs yet

---

## 💡 User Journey Examples

### **Scenario 1: Token-First Customer**
1. Customer visits **havanaelephant.com**
2. Buys €200 worth of HVNA tokens (presale)
3. Goes to **havanaelephantbrand.com** 
4. Connects wallet → Gets **10% discount**
5. Later can mint NFT for higher discounts

### **Scenario 2: NFT Holder**  
1. Customer mints Boldly Elephunky NFT
2. Gets Silver (10%), Gold (25%), or Platinum (50%) tier
3. Goes to Shopify store
4. Connects wallet → Gets **tier-based discount**

### **Scenario 3: Both Holdings**
1. Customer has both tokens AND NFTs
2. System automatically applies **highest available discount**
3. NFT discounts typically higher than token discounts

---

## 🔧 Technical Implementation

### **Smart Contract Logic:**
```solidity
1. Check NFT balance
2. If NFT found → Use NFT tier discount
3. If no NFT → Check token balance  
4. If tokens >= €150 equivalent → 10% discount
5. Return highest applicable discount
```

### **EUR Conversion:**
- **Current Rate**: 1 HVNA = €0.01 (presale price)
- **Threshold**: 15,000 HVNA tokens = €150
- **Dynamic**: Rate updates with token price

---

## 🎨 Shopify Widget Display

### **Before Connection:**
```
🐘 Web3 Holder Discounts
NFT Holders: Up to 50% off | Token Holders (€150+): 10% off
Don't have tokens? Buy HVNA tokens
[Connect Wallet & Get Discount]
```

### **After Connection (Token Holder):**
```
Token Holder (150+ EUR) discount: 10% off your order!
NFTs: 0 | Tokens: €200.00 HVNA
[Apply 10% Discount]
```

### **After Connection (NFT Holder):**
```
Gold Elephant discount: 25% off your order!
NFTs: 1 | Tokens: €50.00 HVNA  
[Apply 25% Discount]
```

---

## 📈 Marketing Benefits

### **Incentivizes Token Purchases**
- Clear path to immediate utility (discounts)
- €150 threshold encourages meaningful purchases
- Drives traffic from Shopify to Web3 site

### **Retention Strategy**
- Token holders stay engaged with brand
- Natural progression: Tokens → NFTs → Higher discounts
- Creates loyal Web3 community

### **Cross-Platform Synergy**
- **Web3 site** drives token/NFT sales  
- **Shopify store** provides immediate utility
- Both platforms benefit from integration

---

## 🚀 Ready to Deploy!

### **Files Updated:**
- ✅ `discount-verifier.js` - Now checks both NFTs and tokens
- ✅ Widget displays both discount types
- ✅ Automatic best discount selection
- ✅ Cross-promotion to Web3 site

### **Deployment Steps:**
1. Upload updated `discount-verifier.js` to Shopify
2. Test with both token holders and NFT holders  
3. Monitor discount usage and conversions
4. Launch marketing campaign highlighting both benefits

---

**Perfect! Now customers can get discounts through multiple paths - buying tokens OR minting NFTs, creating a comprehensive Web3 rewards ecosystem!** 🎉