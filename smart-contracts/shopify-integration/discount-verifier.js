// Shopify Discount Verifier for NFT Holders
// This script verifies NFT ownership and applies discounts

class HVNADiscountVerifier {
    constructor() {
        this.CONTRACT_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"; // NFT Contract
        this.LOYALTY_MANAGER = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"; // Loyalty Manager
        this.NETWORK = "sepolia"; // Change to "mainnet" for production
        
        this.NFT_ABI = [
            "function balanceOf(address owner) external view returns (uint256)",
            "function ownerOf(uint256 tokenId) external view returns (address)",
            "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
        ];
        
        this.LOYALTY_ABI = [
            "function calculateDiscount(address user) external view returns (uint256 discount, string memory reason)",
            "function verifyNFTOwnership(address user, uint256 tokenId) external view returns (bool, uint8)",
            "function linkCustomer(string memory shopifyCustomerId, address wallet) external"
        ];
        
        this.HVNA_ADDRESS = "0x9a0dcE791C7B61647a12266de77a6a1149889f56"; // HVNA Token
        
        this.DISCOUNT_TIERS = {
            1: { name: "Silver Elephant", discount: 10 }, // 10%
            2: { name: "Gold Elephant", discount: 25 },   // 25%
            3: { name: "Platinum Elephant", discount: 50 }, // 50%
            "token": { name: "Token Holder", discount: 10 } // 10% for 150+ EUR in tokens
        };
    }
    
    // Initialize Web3 connection
    async initializeWeb3() {
        if (typeof window.ethereum !== 'undefined') {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.nftContract = new ethers.Contract(this.CONTRACT_ADDRESS, this.NFT_ABI, this.provider);
            this.loyaltyContract = new ethers.Contract(this.LOYALTY_MANAGER, this.LOYALTY_ABI, this.provider);
            return true;
        }
        return false;
    }
    
    // Connect wallet and verify discount eligibility
    async connectAndVerifyDiscount() {
        try {
            // Request wallet connection
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = this.provider.getSigner();
            const userAddress = await signer.getAddress();
            
            // Check both NFT ownership and token holdings
            const nftBalance = await this.nftContract.balanceOf(userAddress);
            const [discount, reason] = await this.loyaltyContract.calculateDiscount(userAddress);
            
            // Check if user has tokens (for 150+ EUR purchase discount)
            const hvnaContract = new ethers.Contract(this.HVNA_ADDRESS, [
                "function balanceOf(address account) external view returns (uint256)"
            ], this.provider);
            const tokenBalance = await hvnaContract.balanceOf(userAddress);
            
            // Calculate EUR equivalent (assuming 1 ETH = 2500 EUR, 1 HVNA = 0.01 EUR)
            const tokenValueEUR = (tokenBalance / 1e18) * 0.01; // HVNA tokens to EUR
            const hasTokenDiscount = tokenValueEUR >= 150;
            
            // Determine best discount
            let bestDiscount = 0;
            let discountReason = "";
            
            if (nftBalance.toNumber() > 0) {
                // NFT holder - use loyalty contract discount
                bestDiscount = discount.toNumber();
                discountReason = reason;
            } else if (hasTokenDiscount) {
                // Token holder with 150+ EUR worth
                bestDiscount = 10;
                discountReason = "Token Holder (150+ EUR)";
            }
            
            if (bestDiscount > 0) {
                return {
                    hasDiscount: true,
                    discount: bestDiscount,
                    reason: discountReason,
                    userAddress: userAddress,
                    nftCount: nftBalance.toNumber(),
                    tokenValue: tokenValueEUR.toFixed(2),
                    message: `${discountReason} discount: ${bestDiscount}% off your order!`
                };
            } else {
                return {
                    hasDiscount: false,
                    discount: 0,
                    nftCount: nftBalance.toNumber(),
                    tokenValue: tokenValueEUR.toFixed(2),
                    message: `No discount available. Need NFT or 150+ EUR in HVNA tokens. You have ${tokenValueEUR.toFixed(2)} EUR in tokens.`
                };
            }
            
        } catch (error) {
            console.error('Verification failed:', error);
            return {
                hasDiscount: false,
                discount: 0,
                error: error.message,
                message: "Verification failed. Please try again."
            };
        }
    }
    
    // Apply discount to Shopify cart
    async applyDiscountToCart(discountPercent, userAddress) {
        try {
            // Generate unique discount code
            const discountCode = `HVNA${discountPercent}${userAddress.slice(-4).toUpperCase()}`;
            
            // Apply discount via Shopify AJAX API
            const response = await fetch('/discount/' + discountCode, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                // Redirect to checkout with discount applied
                window.location.href = `/checkout?discount=${discountCode}`;
            } else {
                throw new Error('Failed to apply discount');
            }
            
        } catch (error) {
            console.error('Failed to apply discount:', error);
            // Fallback: Show discount code to user
            this.showDiscountCode(discountPercent, userAddress);
        }
    }
    
    // Show discount code to user (fallback method)
    showDiscountCode(discountPercent, userAddress) {
        const discountCode = `HVNA${discountPercent}${userAddress.slice(-4).toUpperCase()}`;
        
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    margin: 20px;
                ">
                    <h3 style="color: #667eea; margin-bottom: 20px;">🎉 NFT Holder Discount!</h3>
                    <p style="margin-bottom: 20px;">Your ${discountPercent}% discount code:</p>
                    <div style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #667eea;
                        margin-bottom: 20px;
                        border: 2px dashed #667eea;
                    ">${discountCode}</div>
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">
                        Copy this code and apply it at checkout
                    </p>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: #667eea;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">Got it!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Link wallet to Shopify customer account
    async linkWalletToCustomer(shopifyCustomerId) {
        try {
            const signer = this.provider.getSigner();
            const userAddress = await signer.getAddress();
            
            // Call smart contract to link customer
            const loyaltyWithSigner = this.loyaltyContract.connect(signer);
            const tx = await loyaltyWithSigner.linkCustomer(shopifyCustomerId, userAddress);
            await tx.wait();
            
            return {
                success: true,
                message: "Wallet linked successfully! Future discounts will be applied automatically."
            };
            
        } catch (error) {
            console.error('Failed to link wallet:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Shopify Integration Widget
class ShopifyHVNAWidget {
    constructor() {
        this.verifier = new HVNADiscountVerifier();
        this.isInitialized = false;
    }
    
    async initialize() {
        if (await this.verifier.initializeWeb3()) {
            this.isInitialized = true;
            this.createWidget();
        } else {
            this.showInstallMetaMask();
        }
    }
    
    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'hvna-discount-widget';
        widget.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 20px;
                border-radius: 15px;
                margin: 20px 0;
                text-align: center;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            ">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">🐘 Web3 Holder Discounts</div>
                <div style="margin-bottom: 10px; opacity: 0.9; font-size: 0.9rem;">
                    NFT Holders: Up to 50% off | Token Holders (€150+): 10% off
                </div>
                <div style="margin-bottom: 15px; opacity: 0.8; font-size: 0.8rem;">
                    Don't have tokens? <a href="https://havanaelephant.com" style="color: #90ee90; text-decoration: underline;">Buy HVNA tokens</a>
                </div>
                <button id="verify-nft-btn" style="
                    background: white;
                    color: #667eea;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onclick="hvnaWidget.verifyAndApplyDiscount()">
                    Connect Wallet & Get Discount
                </button>
                <div id="discount-status" style="margin-top: 15px; font-size: 0.9rem;"></div>
            </div>
        `;
        
        // Insert widget before checkout button or in cart drawer
        const target = document.querySelector('.cart__checkout') || 
                      document.querySelector('[name="add"]') || 
                      document.querySelector('.product-form__cart');
        
        if (target) {
            target.parentNode.insertBefore(widget, target);
        } else {
            // Fallback: add to end of body
            document.body.appendChild(widget);
        }
    }
    
    async verifyAndApplyDiscount() {
        const button = document.getElementById('verify-nft-btn');
        const status = document.getElementById('discount-status');
        
        button.textContent = 'Verifying...';
        button.disabled = true;
        
        const result = await this.verifier.connectAndVerifyDiscount();
        
        status.textContent = result.message;
        
        if (result.hasDiscount && result.discount > 0) {
            status.style.color = '#90ee90';
            button.textContent = `Apply ${result.discount}% Discount`;
            button.onclick = () => this.verifier.applyDiscountToCart(result.discount, result.userAddress);
            
            // Show additional info about their holdings
            if (result.tokenValue && result.tokenValue !== "0.00") {
                const additionalInfo = document.createElement('div');
                additionalInfo.style.marginTop = '10px';
                additionalInfo.style.fontSize = '0.8rem';
                additionalInfo.style.opacity = '0.8';
                additionalInfo.innerHTML = `
                    NFTs: ${result.nftCount || 0} | 
                    Tokens: €${result.tokenValue} HVNA
                `;
                status.appendChild(additionalInfo);
            }
        } else {
            status.style.color = '#ffcccb';
            button.textContent = 'No Discount Available';
        }
        
        button.disabled = false;
    }
    
    showInstallMetaMask() {
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div style="
                background: #ff6b6b;
                color: white;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
            ">
                <div>🦊 Install MetaMask to get NFT holder discounts</div>
                <a href="https://metamask.io" target="_blank" style="
                    color: white;
                    text-decoration: underline;
                    margin-top: 10px;
                    display: inline-block;
                ">Install MetaMask</a>
            </div>
        `;
        document.body.appendChild(widget);
    }
}

// Initialize widget when page loads
let hvnaWidget;
document.addEventListener('DOMContentLoaded', () => {
    hvnaWidget = new ShopifyHVNAWidget();
    hvnaWidget.initialize();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HVNADiscountVerifier, ShopifyHVNAWidget };
}