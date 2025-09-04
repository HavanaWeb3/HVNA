# HVNA Presale Integration Guide

## 🚀 Your HVNA Presale is Ready!

**Live Contracts on Sepolia Testnet:**
- Token: `0x9a0dcE791C7B61647a12266de77a6a1149889f56`
- Presale: `0x55ecaE2Eb823e54245dA4764AF6e9797EbFdE257`
- NFT: `0xcD2E1F043C2bdEd1a54c8040A612405028dBd014`

---

## Integration Options for https://havanaelephant.com/

### Option 1: Iframe Embed (Easiest - 5 minutes)
Add this code to any page on your Shopify store:

```html
<div style="text-align: center; margin: 40px 0;">
    <h2>🐘 Join the HVNA Presale</h2>
    <p>Get early access to Havana Elephant Brand tokens</p>
    <iframe 
        src="https://your-domain.com/presale-widget.html" 
        width="100%" 
        height="700px" 
        style="border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
    </iframe>
</div>
```

### Option 2: Dedicated Presale Page (Recommended)
1. Upload `presale-widget.html` to your web hosting
2. Create subdomain: `presale.havanaelephant.com`
3. Point subdomain to the widget file
4. Add navigation links from main site

### Option 3: Shopify Integration
Add to your Shopify theme:

#### Step 3A: Upload Widget
1. Shopify Admin → Online Store → Themes → Actions → Edit Code
2. Assets folder → Upload `presale-widget.html`
3. Create new page template with iframe code

#### Step 3B: Add to Homepage
Add this to your homepage template:

```liquid
<section class="hvna-presale" style="padding: 60px 0; background: #f8f9fa;">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h2 class="text-center mb-4">🐘 HVNA Token Presale</h2>
        <p class="text-center mb-5">Join the Havana Elephant Brand Web3 ecosystem</p>
        <iframe 
          src="{{ 'presale-widget.html' | asset_url }}" 
          width="100%" 
          height="700px"
          style="border: none; border-radius: 20px;">
        </iframe>
      </div>
    </div>
  </div>
</section>
```

### Option 4: Popup Modal
Add a "Join Presale" button that opens the widget in a modal:

```html
<button onclick="openPresaleModal()" class="btn-presale">
  🐘 Join HVNA Presale
</button>

<div id="presaleModal" style="display: none;">
  <iframe src="presale-widget.html" width="500px" height="700px"></iframe>
</div>
```

---

## 🛠️ Files You Need

**Created for you:**
- `frontend/index.html` - Full presale page
- `frontend/presale-widget.html` - Compact widget for embedding
- Both connected to LIVE Sepolia testnet contracts

---

## 📱 Testing Instructions

### For You:
1. Switch MetaMask to **Sepolia testnet**
2. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Open widget and test purchase
4. Verify on [Etherscan](https://sepolia.etherscan.io/address/0x55ecaE2Eb823e54245dA4764AF6e9797EbFdE257)

### For Your Community:
1. Share widget link
2. Instruct users to switch to Sepolia testnet
3. Test purchases with fake ETH
4. Collect feedback before mainnet launch

---

## 🚀 Going Live (Later)

When ready for mainnet:
1. Deploy contracts to Ethereum mainnet
2. Update widget with mainnet addresses
3. Switch from test ETH to real ETH
4. Launch marketing campaign

---

## 💡 Marketing Integration Ideas

### Social Media
```
🐘 The HVNA presale is LIVE! 

Join the Havana Elephant Brand Web3 revolution:
✅ $0.01 per token (early bird price)
✅ 35M tokens available
✅ Connect with MetaMask
✅ Secure blockchain purchase

Test it now: [your-link]
#HVNA #Web3 #Crypto #NFT
```

### Email Campaign
- Subject: "🐘 HVNA Presale is Live - Get Early Access"
- Include widget iframe in email
- CTA: "Connect Wallet & Buy HVNA"

### Website Banners
```html
<div class="presale-banner" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center;">
  <h3>🐘 HVNA Presale Live!</h3>
  <p>Early bird price: $0.01 per token</p>
  <a href="/presale" class="btn-white">Join Now</a>
</div>
```

---

## 🔧 Technical Support

**Widget Features:**
- ✅ MetaMask connection
- ✅ Real-time price calculation
- ✅ Transaction processing
- ✅ Mobile responsive
- ✅ Error handling
- ✅ Success notifications

**Need Help?**
- Test the widget locally first
- Check MetaMask is on Sepolia testnet
- Verify contract addresses are correct
- Monitor transactions on Etherscan

---

**Your presale is ready to go live! Choose your integration method and start testing! 🚀**