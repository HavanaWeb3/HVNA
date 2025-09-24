# 🚀 Havana Elephant Website Update Instructions

## ✅ Your Updated Website is Ready!

I've created a complete updated version of your https://havanaelephant.com/ website with:
- ✅ **Fixed MetaMask detection**
- ✅ **HVNA token purchase integration** 
- ✅ **Genesis NFT discount system**
- ✅ **Base Network auto-switching**
- ✅ **Professional UI/UX design**
- ✅ **Mobile responsive**

## 📁 Files to Deploy

### 1. **Main Website File** 
- `updated-havanaelephant-website.html` → Rename to `index.html`
- This replaces your current homepage

### 2. **Purchase Widget Script**
- `hvna-purchase-widget.js` → Upload to your web server
- Required for token purchases to work

### 3. **Test the Fixed Demo**
- `hvna-purchase-instant.html` → Fixed MetaMask detection
- Use as standalone purchase page or promotional link

## 🚀 Quick Deployment Steps

### Step 1: Backup Current Website
```bash
# Download your current website files as backup
wget -r https://havanaelephant.com/
```

### Step 2: Upload New Files
Upload these files to your web server:
1. `updated-havanaelephant-website.html` → rename to `index.html`
2. `hvna-purchase-widget.js` → keep same name
3. Any existing images/assets you want to keep

### Step 3: Update File References
Make sure the widget script path is correct in your HTML:
```html
<script src="hvna-purchase-widget.js"></script>
```

### Step 4: Test Everything
1. Visit your updated website
2. Click "Connect MetaMask" 
3. Test the purchase flow
4. Verify Genesis NFT discount detection

## 🎯 Key Features Added

### MetaMask Integration ✅
```javascript
// Fixed MetaMask detection that works reliably
const hasEthereum = typeof window.ethereum !== 'undefined';
const hasMetaMask = window.ethereum && window.ethereum.isMetaMask;
```

### Purchase Interface ✅
- **Token Purchase Widget** - Embedded directly in website
- **Real-time Pricing** - ETH/USD conversion
- **Purchase Validation** - Min/max limits enforced
- **Transaction Feedback** - Success/error messages

### Genesis NFT Benefits ✅
- **Automatic Detection** - Checks user's NFT ownership
- **30% Discount** - Applied automatically 
- **Visual Indicators** - Clear discount badges
- **Price Updates** - Dynamic pricing display

### Network Management ✅
- **Auto Base Switch** - Prompts user to switch to Base
- **Network Validation** - Ensures correct network
- **Error Handling** - Clear error messages

## 🎨 Design Improvements

### Modern UI/UX ✅
- **Gradient Backgrounds** - Professional brand colors
- **Card-based Layout** - Clean, organized sections
- **Responsive Design** - Mobile and desktop optimized
- **Smooth Animations** - Fade-in effects and hover states

### Purchase Cards ✅
- **Token Purchase Card** - Complete HVNA buying interface
- **NFT Preview Card** - Coming soon section for Genesis NFTs
- **Feature Lists** - Clear benefits and utilities
- **Call-to-Action Buttons** - Prominent purchase buttons

## 📱 Mobile Optimization

```css
@media (max-width: 768px) {
    .purchase-section {
        grid-template-columns: 1fr; /* Stack on mobile */
    }
    .header-content {
        text-align: center; /* Center on mobile */
    }
}
```

## 🔗 Contract Integration

All your deployed contracts are integrated:
- **HVNA Token**: `0x9B2c154C8B6B1826Df60c81033861891680EBFab`
- **Pre-Sale**: `0x447dddB5115874698FCc3840e24Dc7EfE22deb3b`
- **Genesis NFT**: `0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642`

## 📊 Analytics Integration

The website includes:
- **Microsoft Clarity** - Preserves your existing tracking
- **Purchase Tracking** - Google Analytics events for token purchases
- **Custom Events** - Track wallet connections and user actions

```javascript
// Purchase tracking example
gtag('event', 'purchase', {
    currency: 'USD',
    value: usdCost,
    items: [{ item_name: 'HVNA Token', quantity: tokens }]
});
```

## 🛡️ Security Features

- **Contract Address Validation** ✅
- **Network Verification** ✅ 
- **Purchase Limits** ✅
- **Error Handling** ✅
- **Input Validation** ✅

## 🔧 Testing Checklist

Before going live, test:
- [ ] Website loads correctly
- [ ] MetaMask detection works
- [ ] Wallet connection successful
- [ ] Base network switching works
- [ ] Token purchase flow complete
- [ ] Genesis NFT discount detection
- [ ] Mobile responsive design
- [ ] All links work correctly

## 🌐 Live Deployment

### Option A: Replace Entire Website
1. Rename `updated-havanaelephant-website.html` to `index.html`
2. Upload both files to your web server
3. Test the new website

### Option B: Gradual Rollout
1. Upload as `new-index.html` first
2. Test thoroughly at `havanaelephant.com/new-index.html`
3. Once satisfied, rename to `index.html`

## 📞 Support & Troubleshooting

### Common Issues:

**MetaMask Not Detected:**
- Check browser extensions are enabled
- Try refreshing the page
- Clear browser cache

**Network Issues:**
- Ensure MetaMask is on Base network
- Check internet connection
- Verify contract addresses

**Purchase Failures:**
- Ensure sufficient ETH balance
- Check purchase limits (1,000 - 50,000 tokens)
- Verify wallet is connected

## 🎉 You're Ready to Launch!

Your updated website includes:
- ✅ Professional design matching your brand
- ✅ Full token purchase functionality  
- ✅ Genesis NFT integration
- ✅ Fixed MetaMask detection
- ✅ Mobile optimization
- ✅ Analytics tracking

**The fixed HTML file with proper MetaMask detection is: `updated-havanaelephant-website.html`**

Upload this to replace your current website and your visitors will be able to connect MetaMask and purchase HVNA tokens seamlessly!