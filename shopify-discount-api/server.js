import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://havanaelephantbrand.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Contract addresses from deployment
const PRESALE_CONTRACT = '0x447dddB5115874698FCc3840e24Dc7EfE22deb3b';
const TOKEN_CONTRACT = '0x9B2c154C8B6B1826Df60c81033861891680EBFab';
const NFT_CONTRACT = '0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642';
const BASE_CHAIN_ID = 8453;

// Shopify configuration
const SHOPIFY_STORE = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';

// In-memory store for used codes (in production, use Redis or database)
const usedCodes = new Set();

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);

/**
 * Verify wallet holdings on-chain
 */
async function verifyWalletHoldings(walletAddress) {
  try {
    // Check presale purchase
    const presaleContract = new ethers.Contract(
      PRESALE_CONTRACT,
      ['function purchasedAmount(address) view returns (uint256)'],
      provider
    );
    const presaleAmount = await presaleContract.purchasedAmount(walletAddress);
    const presaleTokens = parseFloat(ethers.formatEther(presaleAmount));

    // Check wallet token balance
    const tokenContract = new ethers.Contract(
      TOKEN_CONTRACT,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const walletBalance = await tokenContract.balanceOf(walletAddress);
    const walletTokens = parseFloat(ethers.formatEther(walletBalance));

    // Check NFT balance
    const nftContract = new ethers.Contract(
      NFT_CONTRACT,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const nftBalance = await nftContract.balanceOf(walletAddress);
    const nftCount = Number(nftBalance);

    // Use higher of presale or wallet
    const totalTokens = Math.max(presaleTokens, walletTokens);
    const tokenValueUSD = totalTokens * 0.01; // $0.01 per token

    return {
      presaleTokens,
      walletTokens,
      totalTokens,
      tokenValueUSD,
      nftCount,
      source: presaleTokens > walletTokens ? 'presale' : 'wallet'
    };
  } catch (error) {
    console.error('Error verifying wallet:', error);
    throw new Error('Failed to verify wallet holdings');
  }
}

/**
 * Calculate discount tier based on holdings
 */
function calculateDiscount(holdings) {
  const { tokenValueUSD, nftCount } = holdings;

  let discount = 0;
  let tier = '';

  // Token-based discounts
  if (tokenValueUSD >= 500) {
    discount = 30;
    tier = 'Gold ($500+)';
  } else if (tokenValueUSD >= 300) {
    discount = 20;
    tier = 'Silver ($300+)';
  } else if (tokenValueUSD >= 150) {
    discount = 10;
    tier = 'Bronze ($150+)';
  }

  // NFT holders get minimum 10%
  if (nftCount > 0 && discount < 10) {
    discount = 10;
    tier = 'NFT Holder';
  }

  return { discount, tier };
}

/**
 * Create unique discount code in Shopify
 */
async function createShopifyDiscount(walletAddress, discountPercent) {
  const timestamp = Date.now().toString(36);
  const walletSuffix = walletAddress.slice(-6).toUpperCase();
  const code = `HVNA${discountPercent}-${walletSuffix}-${timestamp}`;

  // Check if code already used
  if (usedCodes.has(code)) {
    throw new Error('Code already generated');
  }

  const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/price_rules.json`;

  // Create price rule first
  const priceRuleResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN
    },
    body: JSON.stringify({
      price_rule: {
        title: `Web3 Discount ${discountPercent}% - ${walletSuffix}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: 'percentage',
        value: `-${discountPercent}`,
        customer_selection: 'all',
        usage_limit: 1, // One-time use only
        starts_at: new Date().toISOString()
      }
    })
  });

  if (!priceRuleResponse.ok) {
    const error = await priceRuleResponse.json();
    console.error('Shopify price rule error:', error);
    throw new Error('Failed to create discount price rule');
  }

  const priceRuleData = await priceRuleResponse.json();
  const priceRuleId = priceRuleData.price_rule.id;

  // Create discount code
  const discountUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/price_rules/${priceRuleId}/discount_codes.json`;

  const discountResponse = await fetch(discountUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN
    },
    body: JSON.stringify({
      discount_code: {
        code: code
      }
    })
  });

  if (!discountResponse.ok) {
    const error = await discountResponse.json();
    console.error('Shopify discount code error:', error);
    throw new Error('Failed to create discount code');
  }

  // Store code as used
  usedCodes.add(code);

  return code;
}

/**
 * Main endpoint: Generate discount code
 */
app.post('/api/generate-discount', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    console.log(`Processing discount request for wallet: ${walletAddress}`);

    // Verify wallet holdings on-chain
    const holdings = await verifyWalletHoldings(walletAddress);
    console.log('Holdings:', holdings);

    // Calculate discount
    const { discount, tier } = calculateDiscount(holdings);

    if (discount === 0) {
      return res.json({
        success: false,
        message: 'No discount available',
        holdings: {
          tokens: Math.floor(holdings.totalTokens),
          value: holdings.tokenValueUSD.toFixed(2),
          nfts: holdings.nftCount,
          source: holdings.source
        }
      });
    }

    // Create unique Shopify discount code
    const code = await createShopifyDiscount(walletAddress, discount);

    console.log(`Generated code ${code} for wallet ${walletAddress}`);

    res.json({
      success: true,
      code,
      discount,
      tier,
      holdings: {
        tokens: Math.floor(holdings.totalTokens),
        value: holdings.tokenValueUSD.toFixed(2),
        nfts: holdings.nftCount,
        source: holdings.source
      }
    });

  } catch (error) {
    console.error('Error generating discount:', error);
    res.status(500).json({
      error: 'Failed to generate discount code',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    contracts: {
      presale: PRESALE_CONTRACT,
      token: TOKEN_CONTRACT,
      nft: NFT_CONTRACT
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Shopify Discount API running on port ${PORT}`);
  console.log(`📍 Shopify Store: ${SHOPIFY_STORE}`);
  console.log(`⛓️  Base Chain ID: ${BASE_CHAIN_ID}`);
});
