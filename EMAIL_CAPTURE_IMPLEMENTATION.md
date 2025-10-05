# Email Capture Implementation

## Overview
Added email capture functionality to collect customer emails after NFT/Token purchases for building an email list and project community.

## Implementation Details

### 1. Email Capture Dialog Component
**File:** `/src/components/EmailCaptureDialog.jsx`
- Reusable dialog component that appears after successful purchases
- Captures: email, wallet address, purchase type, and timestamp
- Users can either join the community or skip
- Success animation with auto-close after 2 seconds
- Integrates with Netlify Forms for backend storage

### 2. Token Purchase Integration
**File:** `/src/components/HVNATokenPurchase.jsx`
- Email capture dialog appears automatically after successful token purchase
- Triggers when transaction receipt status is `0x1` (success)
- Captures purchase type as "HVNA Token"

### 3. NFT Purchase Integration
**File:** `/src/components/BoldlyElephunkyPurchase.jsx`
- Email capture dialog appears when wallet connects and user owns NFTs
- Since NFTs are purchased via OpenSea (not on-site), we detect ownership on wallet connection
- Captures purchase type as "Boldly Elephunky NFT"

### 4. Backend Storage
**File:** `/index.html`
- Added Netlify form definition for `email-capture`
- Form fields: email, wallet, purchase-type, timestamp
- Emails are stored in Netlify Forms dashboard

## How It Works

### Token Purchases:
1. User purchases HVNA tokens on the site
2. Transaction completes successfully
3. Email capture dialog appears
4. User enters email or skips
5. Email saved to Netlify Forms with wallet address and purchase details

### NFT Purchases:
1. User connects wallet to check NFT ownership
2. System detects user owns Boldly Elephunky NFT(s)
3. Email capture dialog appears
4. User enters email or skips
5. Email saved to Netlify Forms with wallet address and purchase details

## Accessing Collected Emails

### On Netlify:
1. Go to your Netlify site dashboard
2. Navigate to "Forms" section
3. Select "email-capture" form
4. View all submitted emails with associated data:
   - Email address
   - Wallet address
   - Purchase type (Token or NFT)
   - Timestamp

### Export Options:
- Download as CSV from Netlify dashboard
- Integrate with email marketing platforms (Mailchimp, ConvertKit, etc.)
- Set up Netlify form notifications to receive emails in real-time

## Next Steps

1. **Deploy to Netlify** - The form will only work after deployment to Netlify
2. **Test Email Capture** - Make a test purchase to verify the flow
3. **Set up Email Marketing** - Connect Netlify Forms to your email service provider
4. **Create Welcome Email** - Set up automated welcome emails for new subscribers

## Technical Notes

- Email capture is optional - users can skip it
- No email is required to complete the purchase
- Email is captured AFTER successful purchase (not blocking)
- Wallet address is stored for reference and potential airdrops
- Form submissions are stored indefinitely in Netlify (unless deleted)
