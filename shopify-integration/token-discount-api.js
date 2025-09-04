// Shopify Integration API for HVNA Token Discount Verification
// This API checks real-time token balances and calculates applicable discounts

const Web3 = require('web3');
const express = require('express');
const cors = require('cors');

class TokenDiscountAPI {
    constructor() {
        this.app = express();
        this.web3 = new Web3(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
        
        // Contract addresses on Base network
        this.contracts = {
            discountManager: process.env.DISCOUNT_MANAGER_ADDRESS,
            hvnaToken: process.env.HVNA_TOKEN_ADDRESS,
            genesisNFT: process.env.GENESIS_NFT_ADDRESS
        };
        
        // Contract ABIs (simplified)
        this.discountManagerABI = [
            "function getDiscountBreakdown(address user) view returns (bool, uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
            "function getTotalDiscount(address user) view returns (uint256)",
            "function hasDiscount(address user) view returns (bool)"
        ];
        
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Rate limiting middleware
        this.app.use((req, res, next) => {
            // Add rate limiting logic here
            next();
        });
    }
    
    setupRoutes() {
        // Main discount verification endpoint
        this.app.post('/verify-discount', async (req, res) => {
            try {
                const { walletAddress, cartTotal } = req.body;
                
                if (!walletAddress || !this.web3.utils.isAddress(walletAddress)) {
                    return res.status(400).json({
                        error: 'Invalid wallet address'
                    });
                }
                
                const discountInfo = await this.getDiscountInfo(walletAddress);
                const response = this.formatDiscountResponse(discountInfo, cartTotal);
                
                res.json(response);
                
            } catch (error) {
                console.error('Discount verification error:', error);
                res.status(500).json({
                    error: 'Failed to verify discount eligibility',
                    details: error.message
                });
            }
        });
        
        // Check if wallet has any discount
        this.app.get('/has-discount/:walletAddress', async (req, res) => {
            try {
                const { walletAddress } = req.params;
                
                if (!this.web3.utils.isAddress(walletAddress)) {
                    return res.status(400).json({ error: 'Invalid wallet address' });
                }
                
                const contract = new this.web3.eth.Contract(
                    this.discountManagerABI,
                    this.contracts.discountManager
                );
                
                const hasDiscount = await contract.methods.hasDiscount(walletAddress).call();
                
                res.json({ hasDiscount });
                
            } catch (error) {
                res.status(500).json({ error: 'Verification failed' });
            }
        });
        
        // Get detailed breakdown for customer
        this.app.get('/discount-breakdown/:walletAddress', async (req, res) => {
            try {
                const { walletAddress } = req.params;
                const discountInfo = await this.getDiscountInfo(walletAddress);
                res.json(discountInfo);
            } catch (error) {
                res.status(500).json({ error: 'Failed to get discount breakdown' });
            }
        });
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                network: 'Base',
                timestamp: new Date().toISOString()
            });
        });
    }
    
    async getDiscountInfo(walletAddress) {
        const contract = new this.web3.eth.Contract(
            this.discountManagerABI,
            this.contracts.discountManager
        );
        
        const breakdown = await contract.methods.getDiscountBreakdown(walletAddress).call();
        
        return {
            walletAddress,
            isGenesisHolder: breakdown[0],
            tokenBalance: this.web3.utils.fromWei(breakdown[1], 'ether'),
            tokenValueUSD: (breakdown[2] / 100).toFixed(2), // Convert cents to dollars
            tokenTier: parseInt(breakdown[3]),
            baseDiscount: parseInt(breakdown[4]), // Genesis discount
            bonusDiscount: parseInt(breakdown[5]), // Token discount
            totalDiscount: parseInt(breakdown[6]),
            tokensNeededForNextTier: this.web3.utils.fromWei(breakdown[7], 'ether'),
            timestamp: new Date().toISOString()
        };
    }
    
    formatDiscountResponse(discountInfo, cartTotal) {
        const discountPercent = discountInfo.totalDiscount;
        const discountAmount = cartTotal ? (cartTotal * discountPercent / 100) : 0;
        const finalPrice = cartTotal ? (cartTotal - discountAmount) : 0;
        
        return {
            eligible: discountPercent > 0,
            discountPercent,
            discountAmount: discountAmount.toFixed(2),
            finalPrice: finalPrice.toFixed(2),
            breakdown: {
                isGenesisHolder: discountInfo.isGenesisHolder,
                genesisDiscount: discountInfo.baseDiscount,
                tokenDiscount: discountInfo.bonusDiscount,
                tokenTier: this.getTokenTierName(discountInfo.tokenTier),
                tokenValueUSD: discountInfo.tokenValueUSD,
                tokenBalance: parseFloat(discountInfo.tokenBalance).toLocaleString()
            },
            nextTier: this.getNextTierInfo(discountInfo),
            timestamp: discountInfo.timestamp
        };
    }
    
    getTokenTierName(tier) {
        const tiers = {
            0: 'None',
            1: 'Bronze ($150+)',
            2: 'Silver ($250+)', 
            3: 'Gold ($500+)'
        };
        return tiers[tier] || 'Unknown';
    }
    
    getNextTierInfo(discountInfo) {
        const tokensNeeded = parseFloat(discountInfo.tokensNeededForNextTier);
        
        if (tokensNeeded <= 0) {
            return { message: 'Maximum tier reached!' };
        }
        
        const usdNeeded = tokensNeeded * 0.01; // $0.01 per token
        const nextTierDiscount = this.getNextTierDiscount(discountInfo.tokenTier, discountInfo.isGenesisHolder);
        
        return {
            tokensNeeded: tokensNeeded.toLocaleString(),
            usdValueNeeded: usdNeeded.toFixed(2),
            nextTierDiscount,
            message: `Buy ${tokensNeeded.toLocaleString()} more tokens to unlock ${nextTierDiscount}% discount`
        };
    }
    
    getNextTierDiscount(currentTier, isGenesis) {
        if (isGenesis) {
            return currentTier === 0 ? '40%' : '40%'; // Genesis + token bonus
        } else {
            const discounts = { 0: 10, 1: 20, 2: 30 };
            return `${discounts[currentTier] || 30}%`;
        }
    }
    
    start(port = 3001) {
        this.app.listen(port, () => {
            console.log(`🚀 Token Discount API running on port ${port}`);
            console.log(`📊 Network: Base`);
            console.log(`💰 Token Price: $0.01 USD`);
            console.log(`🎯 Discount Tiers: $150 (10%), $250 (20%), $500 (30%)`);
            console.log(`👑 Genesis: 30% base + 10% token bonus = 40% max`);
        });
    }
}

// Shopify webhook integration
class ShopifyIntegration {
    constructor(discountAPI) {
        this.discountAPI = discountAPI;
    }
    
    // Shopify Script Tag for checkout
    generateCheckoutScript() {
        return `
        <script>
        class HavanaTokenDiscount {
            constructor() {
                this.apiEndpoint = '${process.env.API_BASE_URL}/verify-discount';
                this.init();
            }
            
            async init() {
                // Add wallet connection button to checkout
                this.addWalletConnectButton();
            }
            
            addWalletConnectButton() {
                const checkoutForm = document.querySelector('#checkout_form');
                if (!checkoutForm) return;
                
                const walletSection = document.createElement('div');
                walletSection.innerHTML = \`
                    <div class="token-discount-section">
                        <h3>🎯 Token Holder Discount</h3>
                        <p>Connect your wallet to check for HVNA token discounts</p>
                        <button id="connect-wallet-btn" class="btn">Connect Wallet</button>
                        <div id="discount-info" style="display:none;"></div>
                    </div>
                \`;
                
                checkoutForm.insertBefore(walletSection, checkoutForm.firstChild);
                
                document.getElementById('connect-wallet-btn').addEventListener('click', () => {
                    this.connectWalletAndCheckDiscount();
                });
            }
            
            async connectWalletAndCheckDiscount() {
                try {
                    if (typeof window.ethereum === 'undefined') {
                        alert('Please install MetaMask to check token discounts');
                        return;
                    }
                    
                    // Switch to Base network
                    await this.switchToBase();
                    
                    // Connect wallet
                    const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts'
                    });
                    
                    const walletAddress = accounts[0];
                    const cartTotal = this.getCartTotal();
                    
                    // Check discount eligibility
                    const response = await fetch(this.apiEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ walletAddress, cartTotal })
                    });
                    
                    const discountInfo = await response.json();
                    this.displayDiscountInfo(discountInfo);
                    
                    if (discountInfo.eligible) {
                        this.applyDiscount(discountInfo);
                    }
                    
                } catch (error) {
                    console.error('Wallet connection failed:', error);
                    alert('Failed to verify discount eligibility');
                }
            }
            
            async switchToBase() {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x2105' }] // Base mainnet
                    });
                } catch (error) {
                    // Add Base network if not present
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105',
                            chainName: 'Base',
                            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://mainnet.base.org'],
                            blockExplorerUrls: ['https://basescan.org']
                        }]
                    });
                }
            }
            
            getCartTotal() {
                // Extract cart total from Shopify checkout page
                const totalElement = document.querySelector('.total-line__price');
                return totalElement ? parseFloat(totalElement.textContent.replace(/[^0-9.]/g, '')) : 0;
            }
            
            displayDiscountInfo(discountInfo) {
                const infoDiv = document.getElementById('discount-info');
                infoDiv.style.display = 'block';
                
                if (discountInfo.eligible) {
                    infoDiv.innerHTML = \`
                        <div class="discount-success">
                            <h4>🎉 Discount Applied: \${discountInfo.discountPercent}%</h4>
                            <p>Savings: $\${discountInfo.discountAmount}</p>
                            <p>Final Price: $\${discountInfo.finalPrice}</p>
                            <small>\${discountInfo.breakdown.isGenesisHolder ? '👑 Genesis Holder' : ''} 
                            \${discountInfo.breakdown.tokenTier} Token Holder</small>
                        </div>
                    \`;
                } else {
                    infoDiv.innerHTML = \`
                        <div class="discount-info">
                            <p>No discounts available</p>
                            <p>\${discountInfo.nextTier?.message || ''}</p>
                        </div>
                    \`;
                }
            }
            
            applyDiscount(discountInfo) {
                // Apply discount code automatically
                const discountCode = \`HVNA\${discountInfo.discountPercent}\`;
                const discountField = document.querySelector('#checkout_reduction_code');
                
                if (discountField) {
                    discountField.value = discountCode;
                    discountField.dispatchEvent(new Event('change'));
                }
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new HavanaTokenDiscount();
        });
        </script>
        `;
    }
}

// Environment configuration
require('dotenv').config();

// Start the API server
if (require.main === module) {
    const api = new TokenDiscountAPI();
    const port = process.env.PORT || 3001;
    api.start(port);
}

module.exports = { TokenDiscountAPI, ShopifyIntegration };