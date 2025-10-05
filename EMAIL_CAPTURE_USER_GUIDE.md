# Email Capture System - User Guide

## Overview
Your website now automatically captures customer emails after token/NFT purchases to help you build your email list and project community.

---

## When Email Capture Happens

### 1. Token Purchases (HVNA Token)
**Trigger:** Immediately after successful purchase transaction

**User Flow:**
1. Customer purchases HVNA tokens on havanaelephant.com
2. Transaction completes successfully on blockchain
3. Success message appears: "🎉 $HVNA tokens purchased successfully!"
4. **Email capture dialog automatically pops up**
5. Dialog shows:
   - Header: "Stay Connected!" with envelope icon
   - Message: "Join our community to receive updates about your purchase, exclusive offers, and project news"
   - Email input field
   - Two buttons: "Join Community" or "Skip"

**Customer Options:**
- **Enter email & click "Join Community"** → Email saved, success animation shows, dialog closes after 2 seconds
- **Click "Skip"** → Dialog closes immediately, no email saved

---

### 2. NFT Purchases (Boldly Elephunky)
**Trigger:** When customer connects wallet and owns NFTs

**User Flow:**
1. Customer purchases Boldly Elephunky NFT on OpenSea (external)
2. Customer returns to havanaelephant.com
3. Customer clicks "Connect MetaMask" button
4. Wallet connects successfully
5. System detects customer owns NFT(s)
6. **Email capture dialog automatically pops up**
7. Same dialog interface as token purchases

**Why This Timing:**
Since NFTs are purchased on OpenSea (not your site), we can't detect the purchase in real-time. Instead, we detect when NFT holders connect their wallet to your site.

---

## Where Emails Are Stored

### Netlify Forms Dashboard

**Accessing Your Email List:**

1. **Login to Netlify:**
   - Go to https://app.netlify.com
   - Login with your Netlify account

2. **Navigate to Forms:**
   - Click on your site: "havana-elephant-web3" (or your site name)
   - Click "Forms" in the top navigation menu
   - Select "email-capture" from the list of forms

3. **View Submissions:**
   Each submission contains:
   - **Email Address** - Customer's email
   - **Wallet Address** - Their crypto wallet address (for verification/airdrops)
   - **Purchase Type** - Either "HVNA Token" or "Boldly Elephunky NFT"
   - **Timestamp** - When they submitted the email

4. **Export Options:**
   - **Download CSV:** Click "Download CSV" button to export all emails
   - **Email Notifications:** Set up email notifications to receive new submissions in real-time
   - **Integrations:** Connect to Mailchimp, ConvertKit, Zapier, etc.

---

## Setting Up Email Notifications

**Get notified when new emails are captured:**

1. In Netlify Forms dashboard, click "Settings & Usage"
2. Scroll to "Form notifications"
3. Click "Add notification"
4. Select "Email notification"
5. Enter your email address
6. Click "Save"

Now you'll receive an email every time someone joins your list!

---

## Exporting Your Email List

### Method 1: CSV Download (Simple)
1. Go to Netlify Forms → email-capture
2. Click "Download CSV" button
3. Open in Excel/Google Sheets
4. You'll see columns: email, wallet, purchase-type, timestamp

### Method 2: Zapier Integration (Automated)
1. Connect Netlify Forms to Zapier
2. Create Zap: Netlify Form Submission → Email Marketing Platform
3. Automatically sync new emails to Mailchimp, ConvertKit, etc.

### Method 3: Webhook (Advanced)
1. Set up webhook in Netlify Forms settings
2. Point to your own database/API endpoint
3. Receive real-time POST requests with form data

---

## Email Marketing Setup

**Recommended Next Steps:**

### 1. Create Welcome Email Sequence
Once you have emails, set up automated welcome emails:
- Welcome message
- Project overview
- Community links (Discord, Twitter, etc.)
- Exclusive holder benefits

### 2. Segment Your List
Create segments based on purchase type:
- **Token Holders** - Send token-specific updates, staking info, governance news
- **NFT Holders** - Send NFT collection updates, new drops, holder benefits

### 3. Regular Communication
- Monthly project updates
- New feature announcements
- Exclusive offers for email subscribers
- Community events and AMAs

---

## Privacy & Compliance

**Important Notes:**

✅ **Optional System** - Customers can skip email entry
✅ **Post-Purchase** - Email requested AFTER successful purchase (not required to buy)
✅ **Transparent** - Clear message about why you're collecting emails
✅ **Secure** - Stored securely in Netlify's infrastructure

**GDPR/Privacy Compliance:**
- Add privacy policy link to your website
- Include unsubscribe option in all marketing emails
- Only use emails for stated purposes (project updates, offers, community news)
- Don't sell or share emails with third parties

---

## Monitoring & Analytics

**Track Your Email List Growth:**

1. **Netlify Forms Dashboard:**
   - Shows total submissions
   - Graph of submissions over time
   - Submission rate

2. **Conversion Rate:**
   - Compare form submissions to total purchases
   - Track how many customers opt-in vs skip

3. **Email Platform Analytics:**
   - Once integrated with email platform (Mailchimp, etc.)
   - Track open rates, click rates, engagement

---

## Troubleshooting

### "I don't see the email capture dialog"

**Possible Causes:**
- Form only appears after successful purchase (tokens) or for NFT holders (NFTs)
- Browser pop-up blocker might be interfering
- Need to redeploy site after code changes

**Solution:**
- Make a test token purchase to verify
- Check browser console for errors (F12 → Console tab)

### "Emails not appearing in Netlify Forms"

**Possible Causes:**
- Form not yet initialized by Netlify (needs first deploy after form added)
- JavaScript errors preventing form submission

**Solution:**
- Check Netlify deploy log for form detection
- Look for "Form 'email-capture' detected" message
- May need to trigger a new Netlify deploy

### "Want to customize the dialog design/message"

**Location:** `/src/components/EmailCaptureDialog.jsx`
**Editable:**
- Dialog title and description
- Button text
- Success message
- Colors and styling

---

## Quick Reference

| What | Where | How |
|------|-------|-----|
| **View Emails** | Netlify Dashboard → Forms → email-capture | Click on site → Forms |
| **Download List** | Netlify Forms page | "Download CSV" button |
| **Email Notifications** | Netlify Forms → Settings | Add email notification |
| **Customize Dialog** | `/src/components/EmailCaptureDialog.jsx` | Edit code, commit, deploy |
| **Form Data Structure** | Netlify Forms dashboard | email, wallet, purchase-type, timestamp |

---

## Support

**Need Help?**
- Check Netlify Forms documentation: https://docs.netlify.com/forms/setup/
- Review `/EMAIL_CAPTURE_IMPLEMENTATION.md` for technical details
- Review `/EMAIL_CAPTURE_TECHNICAL_DOCS.md` for developer maintenance guide

**Deployment Status:**
✅ Code pushed to GitHub repository
⏳ Auto-deploys to Netlify when pushed to main branch
🎯 Email capture active once Netlify build completes

---

## Success Metrics to Track

1. **Email Capture Rate:** % of buyers who provide email vs skip
2. **List Growth:** Total emails collected per week/month
3. **Segmentation:** Token holders vs NFT holders ratio
4. **Engagement:** Email open rates and click rates (once connected to email platform)
5. **Community Growth:** Discord/Twitter follows from email subscribers

---

**Your email list is now your most valuable asset for building a loyal community around your project!** 🎉
