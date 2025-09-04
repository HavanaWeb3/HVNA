# Shopify + Web3 Integration Guide
## havanaelephant.com ↔ havanaelephantbrand.com

---

## 🏗️ Architecture Overview

### **havanaelephant.com (Web3 Site)**
- **Token Presale**: Users buy HVNA tokens
- **NFT Minting**: Users mint Boldly Elephunky NFTs  
- **Wallet Connection**: MetaMask integration

### **havanaelephantbrand.com (Shopify Store)**
- **Discount Verification**: Checks NFT ownership
- **Automatic Discounts**: Applies based on NFT tier
- **Customer Linking**: Links wallets to Shopify accounts

---

## 🔧 Integration Setup

### **Step 1: Add Discount Verifier to Shopify**

1. **Upload JavaScript File**
   - Go to: Shopify Admin → Online Store → Themes → Actions → Edit Code
   - Go to: Assets folder
   - Upload: `discount-verifier.js`

2. **Add to Theme**
   ```liquid
   <!-- Add to theme.liquid before </head> -->
   <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>
   {{ 'discount-verifier.js' | asset_url | script_tag }}
   ```

### **Step 2: Add Widget to Cart/Checkout**

Add this to your cart template (`cart.liquid` or `cart-drawer.liquid`):

```liquid
<div id="hvna-discount-section">
  <!-- Widget will be automatically inserted here -->
</div>
```

### **Step 3: Create Discount Codes (Backend)**

Create these discount codes in Shopify Admin:

```
HVNA10**** - 10% off (Silver NFT holders)
HVNA25**** - 25% off (Gold NFT holders)  
HVNA50**** - 50% off (Platinum NFT holders)
```

**** = Last 4 characters of wallet address

---

## 🎯 How It Works

### **User Experience Flow:**

1. **User visits havanaelephantbrand.com**
2. **Sees "NFT Holder Discount" widget** in cart
3. **Clicks "Connect Wallet & Get Discount"**
4. **MetaMask connects** to Sepolia testnet
5. **Smart contract checks** NFT ownership
6. **Discount automatically applied** at checkout

### **Discount Tiers:**
- 🥈 **Silver Elephant**: 10% off
- 🥇 **Gold Elephant**: 25% off  
- 💎 **Platinum Elephant**: 50% off

---

## 📋 Files Created

### **For Web3 Site (havanaelephant.com):**
- ✅ `presale-widget.html` - Token purchase interface
- ✅ `nft-mint.html` - NFT minting interface
- ✅ `index.html` - Combined presale page

### **For Shopify Store (havanaelephantbrand.com):**
- ✅ `discount-verifier.js` - NFT verification & discount application
- ✅ Integration instructions

---

## 🚀 Testing Process

### **Test on Sepolia Testnet:**

1. **Mint NFT** on havanaelephant.com
   - Connect MetaMask to Sepolia
   - Mint with test ETH
   - Verify NFT appears in wallet

2. **Test Discount** on havanaelephantbrand.com
   - Add items to cart
   - Connect same wallet
   - Verify discount applies

3. **Complete Purchase**
   - Proceed to checkout
   - Discount should remain applied
   - Complete with Shopify test mode

---

## 🔧 Advanced Features

### **Customer Account Linking**
Link Web3 wallets to Shopify customer accounts for automatic discounts:

```javascript
// Called after customer logs in
hvnaWidget.verifier.linkWalletToCustomer(shopifyCustomerId);
```

### **Bulk Discount Management**
Create discount codes programmatically:

```javascript
// Generate discount codes for all NFT holders
const discountCodes = await generateDiscountCodes();
```

### **Analytics Integration**
Track Web3 user behavior:

```javascript
// Track NFT holder conversions
analytics.track('nft_holder_discount_applied', {
  wallet: userAddress,
  discount: discountPercent,
  order_value: cartTotal
});
```

---

## 🛡️ Security Considerations

### **Smart Contract Verification:**
- ✅ All discount verification happens on-chain
- ✅ Cannot be manipulated by users
- ✅ Real-time NFT ownership checking

### **Shopify Security:**
- ✅ Discount codes generated server-side
- ✅ One-time use prevention
- ✅ Maximum discount limits

---

## 🌐 Going Live (Production)

### **When Ready for Mainnet:**

1. **Deploy Contracts to Ethereum Mainnet**
2. **Update Contract Addresses** in both sites
3. **Switch from Sepolia to Mainnet** in all code
4. **Test with Real ETH** (small amounts)
5. **Launch Marketing Campaign**

### **Mainnet Contract Deployment:**
```bash
npx hardhat run scripts/deployEcosystem.js --network mainnet
```

---

## 📱 Mobile Optimization

### **Mobile Wallet Support:**
- ✅ MetaMask mobile app integration
- ✅ WalletConnect for other wallets
- ✅ Responsive design for all screen sizes

---

## 💡 Marketing Integration

### **Cross-Platform Promotion:**

1. **Web3 Site → Shopify**
   - "Shop with your NFT" buttons
   - Discount reminders for NFT holders
   - Cross-promotion banners

2. **Shopify → Web3 Site**
   - "Get NFT for discounts" CTAs
   - Token presale promotions
   - Web3 education content

---

## 🎉 Ready to Deploy!

**Your complete ecosystem is ready:**

### **havanaelephant.com Features:**
- 🐘 Token presale (35M HVNA available)
- 🎨 NFT minting (10K collection)
- 🔐 Secure Web3 integration

### **havanaelephantbrand.com Features:**
- 💰 Automatic NFT holder discounts
- 🛡️ Blockchain-verified ownership
- 🛒 Seamless shopping experience

**Next Steps:**
1. Upload files to your websites
2. Test the full user journey
3. Launch with your community!

---

**Questions? Need help with setup? The integration is designed to be plug-and-play!** 🚀