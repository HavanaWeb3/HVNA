# Email Capture System - Technical Documentation

## For Developer Handoff & Maintenance

**Last Updated:** October 5, 2025
**Version:** 1.0
**Git Commit:** 5ce4269e2

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Component Structure](#component-structure)
3. [Implementation Details](#implementation-details)
4. [Data Flow](#data-flow)
5. [Backend Integration](#backend-integration)
6. [Testing & Debugging](#testing--debugging)
7. [Maintenance Tasks](#maintenance-tasks)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Future Enhancements](#future-enhancements)

---

## System Architecture

### Overview
Post-purchase email capture system integrated into React-based Web3 application. Uses Netlify Forms as serverless backend for email storage.

### Tech Stack
- **Frontend:** React 19.1.0 (Vite build)
- **UI Components:** Radix UI + Custom components
- **Web3:** ethers.js 6.15.0
- **Backend:** Netlify Forms (serverless)
- **Deployment:** Netlify (auto-deploy from GitHub)

### File Structure
```
/Users/davidsime/hvna-ecosystem/
├── src/
│   └── components/
│       ├── EmailCaptureDialog.jsx          # Core email capture component
│       ├── HVNATokenPurchase.jsx           # Token purchase integration
│       └── BoldlyElephunkyPurchase.jsx     # NFT purchase integration
├── index.html                               # Netlify form definition
├── netlify.toml                             # Netlify configuration
└── dist/                                    # Build output (auto-generated)
```

---

## Component Structure

### 1. EmailCaptureDialog.jsx

**Purpose:** Reusable modal dialog for email capture

**Props:**
```javascript
{
  isOpen: Boolean,           // Controls dialog visibility
  onClose: Function,         // Callback when dialog closes
  purchaseType: String,      // "HVNA Token" or "Boldly Elephunky NFT"
  walletAddress: String      // User's connected wallet address
}
```

**State Management:**
```javascript
const [email, setEmail] = useState('')                    // Email input value
const [isSubmitting, setIsSubmitting] = useState(false)   // Submission state
const [submitStatus, setSubmitStatus] = useState('')      // Status message
const [isSuccess, setIsSuccess] = useState(false)         // Success flag
```

**Key Functions:**

#### handleSubmit(e)
```javascript
// Submits email to Netlify Forms
// POST to "/" with URLSearchParams
// Form data: form-name, email, wallet, purchase-type, timestamp
```

#### handleSkip()
```javascript
// Closes dialog without saving
// Resets all state values
```

**Dependencies:**
- `@/components/ui/button.jsx` - Button component
- `@/components/ui/dialog.jsx` - Dialog primitives (Radix UI)
- `lucide-react` - Icons (Mail, Loader2, CheckCircle)

**Styling:**
- Tailwind CSS classes
- Responsive design (sm:max-w-[425px])
- Focus states and accessibility

---

### 2. HVNATokenPurchase.jsx Integration

**Location:** Line 18 (import), Line 36 (state), Line 334 (trigger), Line 745-750 (render)

**State Addition:**
```javascript
const [showEmailCapture, setShowEmailCapture] = useState(false)
```

**Trigger Logic:**
```javascript
// Inside purchaseTokens() function after transaction success
if (receipt && receipt.status === '0x1') {
  setPurchaseStatus('🎉 $HVNA tokens purchased successfully!')
  await updateUserInfo(userAddress)
  setShowEmailCapture(true)  // ← Email capture trigger
}
```

**Component Integration:**
```jsx
<EmailCaptureDialog
  isOpen={showEmailCapture}
  onClose={() => setShowEmailCapture(false)}
  purchaseType="HVNA Token"
  walletAddress={userAddress}
/>
```

**Transaction Flow:**
1. User initiates token purchase
2. Transaction submitted to blockchain (Base network)
3. `waitForTransaction()` polls for receipt
4. Receipt status `0x1` indicates success
5. Email dialog triggers automatically

---

### 3. BoldlyElephunkyPurchase.jsx Integration

**Location:** Line 16 (import), Line 26 (state), Line 176-178 (trigger), Line 544-549 (render)

**State Addition:**
```javascript
const [showEmailCapture, setShowEmailCapture] = useState(false)
```

**Trigger Logic:**
```javascript
// Inside checkOwnedNFTs() function
const checkOwnedNFTs = async (address) => {
  // ... NFT ownership check logic ...
  setOwnedNFTs(owned)

  // If user owns NFTs, show email capture
  if (owned.length > 0) {
    setShowEmailCapture(true)  // ← Email capture trigger
  }
}
```

**NFT Detection Flow:**
1. User connects MetaMask wallet
2. `connectWallet()` → `updateUserInfo()` → `checkOwnedNFTs()`
3. Loops through NFT token IDs 1-10
4. Calls `getTokenOwner(tokenId)` for each
5. If any NFT owned by connected address, triggers email dialog

**Why This Approach:**
NFTs purchased on OpenSea (external marketplace), so can't detect purchase in real-time. Instead, detect ownership when user connects wallet to site.

---

## Implementation Details

### Netlify Forms Configuration

**File:** `index.html` (Lines 51-56)

```html
<form name="email-capture" netlify netlify-honeypot="bot-field" hidden>
  <input type="email" name="email" />
  <input type="text" name="wallet" />
  <input type="text" name="purchase-type" />
  <input type="text" name="timestamp" />
</form>
```

**Key Attributes:**
- `name="email-capture"` - Form identifier for Netlify
- `netlify` - Enables Netlify Forms processing
- `netlify-honeypot="bot-field"` - Anti-spam protection
- `hidden` - Form not visible (JavaScript handles submission)

**How It Works:**
1. Netlify detects form during build process
2. Creates serverless function endpoint
3. Form submissions POST to `/` with `Content-Type: application/x-www-form-urlencoded`
4. Netlify processes and stores in dashboard

---

## Data Flow

### Token Purchase Email Capture

```
User Action
    ↓
[Connect Wallet] → Wallet connected
    ↓
[Enter Token Amount] → 1000+ HVNA tokens
    ↓
[Click Purchase] → Transaction initiated
    ↓
[Blockchain Transaction] → Base network (0x2105)
    ↓
    ├─ Contract: 0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B (Presale)
    ├─ Method: buyTokens() or buyTokensWithDiscount()
    ├─ Value: ETH payment
    └─ Gas: User pays
    ↓
[Wait for Receipt] → Poll eth_getTransactionReceipt
    ↓
[Receipt Status 0x1] → Success!
    ↓
[Trigger Email Dialog] → setShowEmailCapture(true)
    ↓
User Sees Dialog
    ↓
    ├─ [Enter Email + Submit] → POST to Netlify
    │       ↓
    │   [Netlify Stores Data]
    │       ↓
    │   [Success Animation] → Auto-close after 2s
    │
    └─ [Click Skip] → Dialog closes immediately
```

### NFT Purchase Email Capture

```
User Action (External)
    ↓
[Buy NFT on OpenSea] → Purchase outside our site
    ↓
[Return to Site] → havanaelephant.com
    ↓
[Connect Wallet] → MetaMask connection
    ↓
[Wallet Connected] → updateUserInfo() called
    ↓
[checkOwnedNFTs()] → Loop token IDs 1-10
    ↓
    ├─ Contract: 0x815D1bfaF945aCa39049FF243D6E406e2aEc3ff5
    ├─ Method: ownerOf(tokenId)
    └─ Check if owner === connected wallet
    ↓
[Owned NFTs Found] → ownedNFTs.length > 0
    ↓
[Trigger Email Dialog] → setShowEmailCapture(true)
    ↓
Same as token flow above
```

---

## Backend Integration

### Netlify Forms API

**Endpoint:** `POST /`

**Request Format:**
```javascript
const formData = new URLSearchParams()
formData.append('form-name', 'email-capture')
formData.append('email', 'user@example.com')
formData.append('wallet', '0x1234...5678')
formData.append('purchase-type', 'HVNA Token')
formData.append('timestamp', '2025-10-05T12:00:00.000Z')

fetch('/', {
  method: 'POST',
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: formData.toString()
})
```

**Response:**
- **200 OK** - Form submission successful
- **400 Bad Request** - Validation error
- **404 Not Found** - Form not detected by Netlify (needs redeploy)

**Data Storage:**
- Stored in Netlify's database (PostgreSQL backend)
- Accessible via Netlify UI or API
- No retention limit (stored indefinitely unless manually deleted)

### Accessing Data Programmatically

**Netlify API:**
```bash
# Get form submissions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.netlify.com/api/v1/forms/{form_id}/submissions
```

**Webhook Integration:**
```javascript
// Netlify sends POST to your endpoint on new submission
{
  "form_id": "...",
  "form_name": "email-capture",
  "data": {
    "email": "user@example.com",
    "wallet": "0x1234...5678",
    "purchase-type": "HVNA Token",
    "timestamp": "2025-10-05T12:00:00.000Z"
  }
}
```

---

## Testing & Debugging

### Local Development

**Run Dev Server:**
```bash
cd ~/hvna-ecosystem
npm run dev
```

**Issue:** Netlify Forms don't work in local dev

**Solution:**
1. Test form submission logic manually
2. Deploy to Netlify staging/preview branch
3. Use Netlify Dev CLI (optional):
```bash
npx netlify dev
```

### Testing Email Capture

#### Test Token Purchase Flow
```javascript
// In browser console after connecting wallet:
setShowEmailCapture(true)
```

#### Test NFT Flow
```javascript
// Simulate NFT ownership:
setOwnedNFTs([1, 2])  // Will trigger email dialog
```

### Debugging Common Issues

#### Dialog Not Appearing

**Check:**
1. React DevTools - is `showEmailCapture` true?
2. Browser console - any errors?
3. Dialog component imported correctly?

**Debug Code:**
```javascript
// Add logging to trigger points
console.log('Purchase successful, triggering email capture')
setShowEmailCapture(true)
```

#### Form Submission Failing

**Check:**
1. Network tab - is POST request sent to "/"?
2. Request payload - are all fields present?
3. Response status - 200 or error?

**Debug Code:**
```javascript
const response = await fetch('/', { ... })
console.log('Response status:', response.status)
const text = await response.text()
console.log('Response body:', text)
```

#### Netlify Forms Not Detected

**Symptoms:**
- 404 error on form submission
- "Form not found" message

**Solution:**
```bash
# Trigger new Netlify deploy
git commit --allow-empty -m "Redeploy for form detection"
git push
```

**Verify in Netlify:**
1. Build logs should show: "Form 'email-capture' detected"
2. Forms tab should list "email-capture"

---

## Maintenance Tasks

### Regular Maintenance

#### 1. Monitor Email Collection Rate
```bash
# Export CSV monthly
# Track: submissions per week, conversion rate
```

#### 2. Check for Spam Submissions
```bash
# Netlify honeypot should catch most spam
# Manually review suspicious entries (e.g., invalid wallet addresses)
```

#### 3. Update Dialog Copy/Design
**File:** `/src/components/EmailCaptureDialog.jsx`

```javascript
// Edit these lines:
<DialogTitle>Stay Connected!</DialogTitle>
<DialogDescription>
  Join our community to receive updates...
</DialogDescription>
```

#### 4. Export & Backup Email List
```bash
# Download CSV from Netlify monthly
# Store in secure location
# Import to email marketing platform
```

### Dependency Updates

**Check for Updates:**
```bash
npm outdated
```

**Key Dependencies:**
- `react`, `react-dom` - UI framework
- `ethers` - Web3 interactions
- `@radix-ui/*` - UI components
- `lucide-react` - Icons

**Update Process:**
```bash
npm update
npm run build  # Test build
npm run dev    # Test locally
git commit -m "Update dependencies"
git push       # Deploy
```

### Configuration Changes

#### Change Form Name
**Files to update:**
1. `index.html` - form name attribute
2. `EmailCaptureDialog.jsx` - form-name field value

```javascript
// EmailCaptureDialog.jsx
formData.append('form-name', 'new-form-name')
```

#### Add Additional Fields
**Example: Capture purchase amount**

1. **Update index.html:**
```html
<form name="email-capture" netlify>
  <input type="email" name="email" />
  <input type="text" name="wallet" />
  <input type="text" name="purchase-type" />
  <input type="text" name="timestamp" />
  <input type="text" name="purchase-amount" />  <!-- NEW -->
</form>
```

2. **Update EmailCaptureDialog.jsx:**
```javascript
// Add new prop
const EmailCaptureDialog = ({ isOpen, onClose, purchaseType, walletAddress, purchaseAmount }) => {

  // Add to form submission
  formData.append('purchase-amount', purchaseAmount)
}
```

3. **Update integration points:**
```jsx
<EmailCaptureDialog
  purchaseType="HVNA Token"
  walletAddress={userAddress}
  purchaseAmount={tokenAmount}  // NEW
/>
```

---

## Common Issues & Solutions

### Issue 1: Email Dialog Shows on Every Wallet Connection

**Symptom:** NFT holders see email dialog every time they connect wallet

**Cause:** No localStorage persistence to track if user already submitted email

**Solution:**
```javascript
// EmailCaptureDialog.jsx - Add localStorage check
useEffect(() => {
  const hasSubmitted = localStorage.getItem(`email-submitted-${walletAddress}`)
  if (hasSubmitted) {
    onClose()  // Don't show if already submitted
  }
}, [walletAddress])

// On successful submission:
localStorage.setItem(`email-submitted-${walletAddress}`, 'true')
```

### Issue 2: Form Submissions Not Appearing in Netlify

**Symptom:** Form submits without errors, but no data in Netlify dashboard

**Debug Steps:**
1. Check Netlify build logs for form detection
2. Verify form name matches exactly
3. Check if spam filter caught submission
4. Verify Netlify site is correctly linked

**Solution:**
```bash
# Force rebuild
netlify deploy --prod

# Or via git
git commit --allow-empty -m "Trigger Netlify rebuild"
git push
```

### Issue 3: Dialog Styling Broken

**Symptom:** Dialog appears but looks unstyled or misaligned

**Cause:** Tailwind CSS classes not compiled or Radix UI CSS missing

**Solution:**
1. Check Tailwind config includes component paths:
```javascript
// tailwind.config.js
content: [
  "./src/**/*.{js,jsx,ts,tsx}",
]
```

2. Rebuild:
```bash
npm run build
```

### Issue 4: CORS Errors on Form Submission

**Symptom:** Network error when submitting form

**Cause:** Trying to submit to wrong domain or Netlify site not configured

**Solution:**
- Form should submit to same domain (relative path "/")
- Check `fetch('/', ...)` not `fetch('https://...')`

---

## Future Enhancements

### Recommended Improvements

#### 1. Email Validation
```javascript
// Add email validation before submission
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// In handleSubmit:
if (!isValidEmail(email)) {
  setSubmitStatus('❌ Please enter a valid email address')
  return
}
```

#### 2. Double Opt-In
```javascript
// Send confirmation email
// Require user to click link to confirm subscription
// Prevents fake/mistyped emails
```

#### 3. CRM Integration
```javascript
// Webhook to send data to CRM
// Options: HubSpot, Salesforce, Pipedrive
// Netlify → Zapier → CRM
```

#### 4. Analytics Tracking
```javascript
// Track conversion rate
// Google Analytics event on email submission
gtag('event', 'email_captured', {
  'event_category': 'engagement',
  'event_label': purchaseType
})
```

#### 5. A/B Testing
```javascript
// Test different dialog copy/timing
// Use split testing to optimize conversion
// Track which variant performs better
```

#### 6. Social Proof
```javascript
// Show "Join 1,234+ community members"
// Update count from Netlify Forms API
// Increases conversion rate
```

#### 7. Incentive
```javascript
// Offer bonus for email signup
// "Get 5% extra HVNA tokens when you join our email list"
// Increases opt-in rate
```

---

## API Reference

### EmailCaptureDialog Component

```typescript
interface EmailCaptureDialogProps {
  isOpen: boolean;              // Controls dialog visibility
  onClose: () => void;          // Callback when dialog closes
  purchaseType: string;         // Purchase type label
  walletAddress: string;        // User's wallet address
}

// Usage:
<EmailCaptureDialog
  isOpen={showEmailCapture}
  onClose={() => setShowEmailCapture(false)}
  purchaseType="HVNA Token"
  walletAddress="0x1234...5678"
/>
```

### State Variables

```typescript
// HVNATokenPurchase.jsx
const [showEmailCapture, setShowEmailCapture] = useState<boolean>(false)

// BoldlyElephunkyPurchase.jsx
const [showEmailCapture, setShowEmailCapture] = useState<boolean>(false)
```

### Form Data Structure

```typescript
interface EmailCaptureFormData {
  'form-name': 'email-capture';
  email: string;                    // User's email address
  wallet: string;                   // Blockchain wallet address (0x...)
  'purchase-type': string;          // "HVNA Token" | "Boldly Elephunky NFT"
  timestamp: string;                // ISO 8601 timestamp
}
```

---

## Build & Deployment

### Build Process

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development build (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### Netlify Deployment

**Automatic Deployment:**
- Push to `main` branch → Netlify auto-deploys
- Build command: `npm install --legacy-peer-deps && npm run build`
- Publish directory: `dist`

**Manual Deployment:**
```bash
# Via Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**Deploy Status:**
- Check: https://app.netlify.com/sites/YOUR_SITE/deploys
- Build logs show form detection
- Forms appear in dashboard after first deploy

---

## Security Considerations

### 1. Email Storage
- Emails stored in Netlify's secure infrastructure
- Access restricted to Netlify account owners
- No public access to form submissions

### 2. Wallet Address Privacy
- Wallet addresses are public blockchain data
- Storing alongside email creates linkable identity
- Consider GDPR implications in EU

### 3. Spam Protection
- Netlify honeypot field prevents bot submissions
- Consider adding reCAPTCHA for extra protection
- Rate limiting via Netlify Edge Functions (optional)

### 4. Data Access
- Restrict Netlify account access
- Enable 2FA on Netlify account
- Audit team member permissions regularly

### 5. Email Usage
- Only use for stated purposes
- Provide unsubscribe option
- Don't sell or share email list
- Comply with CAN-SPAM, GDPR, etc.

---

## Contact & Support

**Project Repository:** https://github.com/HavanaWeb3/HVNA
**Latest Commit:** 5ce4269e2
**Implementation Date:** October 5, 2025

**For Technical Issues:**
1. Check this documentation
2. Review `/EMAIL_CAPTURE_IMPLEMENTATION.md`
3. Review `/EMAIL_CAPTURE_USER_GUIDE.md`
4. Check Netlify Forms documentation: https://docs.netlify.com/forms/

**For Netlify Support:**
- Documentation: https://docs.netlify.com
- Support: https://answers.netlify.com
- Status: https://www.netlifystatus.com

---

## Changelog

### Version 1.0 (October 5, 2025)
- Initial implementation of email capture system
- Integration with HVNATokenPurchase component
- Integration with BoldlyElephunkyPurchase component
- Netlify Forms backend setup
- Documentation created

---

**End of Technical Documentation**
