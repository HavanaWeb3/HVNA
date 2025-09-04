// HVNA Shopify Widget - Demo Mode with Working Discounts
class ShopifyHVNAWidget {
    constructor() {
        console.log('HVNA Widget created');
        this.isConnected = false;
        this.userAddress = null;
    }
    
    initialize() {
        console.log('HVNA Widget initializing...');
        this.createWidget();
    }
    
    createWidget() {
        // Create main widget container
        const widget = document.createElement('div');
        widget.id = 'hvna-widget';
        widget.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        widget.style.color = 'white';
        widget.style.padding = '20px';
        widget.style.margin = '20px 0';
        widget.style.borderRadius = '15px';
        widget.style.textAlign = 'center';
        widget.style.fontWeight = 'bold';
        widget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        
        // Create widget content
        const content = document.createElement('div');
        
        // Title
        const title = document.createElement('div');
        title.textContent = '🐘 Exclusive Web3 Discounts';
        title.style.fontSize = '1.3rem';
        title.style.marginBottom = '10px';
        
        // Benefits text
        const benefits = document.createElement('div');
        benefits.textContent = 'NFT holders up to 30% off | Token holders up to 30% off (tiered)';
        benefits.style.fontSize = '0.9rem';
        benefits.style.opacity = '0.9';
        benefits.style.marginBottom = '15px';
        
        // Connect button
        const connectBtn = document.createElement('button');
        connectBtn.textContent = 'Connect Wallet for Discount';
        connectBtn.style.background = 'white';
        connectBtn.style.color = '#667eea';
        connectBtn.style.border = 'none';
        connectBtn.style.padding = '12px 24px';
        connectBtn.style.borderRadius = '8px';
        connectBtn.style.fontSize = '1rem';
        connectBtn.style.fontWeight = '600';
        connectBtn.style.cursor = 'pointer';
        connectBtn.style.transition = 'all 0.3s ease';
        
        // Button hover effects
        connectBtn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        };
        connectBtn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        
        // Button click handler
        connectBtn.onclick = () => this.connectWallet();
        
        // Status message area
        const statusArea = document.createElement('div');
        statusArea.id = 'hvna-status';
        statusArea.style.marginTop = '15px';
        statusArea.style.fontSize = '0.9rem';
        statusArea.style.minHeight = '20px';
        
        // Assemble widget
        content.appendChild(title);
        content.appendChild(benefits);
        content.appendChild(connectBtn);
        content.appendChild(statusArea);
        widget.appendChild(content);
        
        // Insert widget
        const target = document.querySelector('#hvna-discount-widget-container') || document.body;
        target.appendChild(widget);
        
        console.log('HVNA Widget created and inserted');
    }
    
    async connectWallet() {
        const statusEl = document.getElementById('hvna-status');
        const connectBtn = document.querySelector('#hvna-widget button');
        
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            statusEl.innerHTML = '❌ MetaMask not found. <a href="https://metamask.io" target="_blank" style="color: #90ee90;">Install MetaMask</a>';
            return;
        }
        
        try {
            // Update button state
            connectBtn.textContent = 'Connecting...';
            connectBtn.disabled = true;
            statusEl.textContent = 'Connecting to MetaMask...';
            
            // Request wallet connection
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                this.userAddress = accounts[0];
                this.isConnected = true;
                
                // Update UI for connected state
                connectBtn.textContent = 'Verify Holdings';
                connectBtn.disabled = false;
                connectBtn.onclick = () => this.verifyHoldings();
                
                statusEl.innerHTML = `✅ Connected: ${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
                
                console.log('Wallet connected:', this.userAddress);
            }
            
        } catch (error) {
            console.error('Connection failed:', error);
            connectBtn.textContent = 'Connect Wallet for Discount';
            connectBtn.disabled = false;
            
            if (error.code === 4001) {
                statusEl.textContent = '❌ Connection rejected by user';
            } else {
                statusEl.textContent = '❌ Connection failed. Please try again.';
            }
        }
    }
    
    async verifyHoldings() {
        const statusEl = document.getElementById('hvna-status');
        const connectBtn = document.querySelector('#hvna-widget button');
        
        try {
            connectBtn.textContent = 'Verifying...';
            connectBtn.disabled = true;
            statusEl.textContent = '🔍 Verifying Web3 holdings...';
            
            // Simulate verification delay for realistic feel
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Demo logic based on wallet address
            let bestDiscount = 0;
            let discountType = '';
            let nftCount = 0;
            let tokenValueEUR = 0;
            
            // Check wallet address patterns for demo
            const addressLower = this.userAddress.toLowerCase();
            
            // Your specific wallet gets the maximum token holder discount
            if (addressLower === '0x4844382d686ce775e095315c084d40ced16d8cf5') {
                tokenValueEUR = 400000; // €400,000 in tokens
                bestDiscount = 30;
                discountType = 'Token Holder (€500+)';
            }
            // Demo NFT holders based on address patterns
            else if (addressLower.includes('0000') || addressLower.includes('1111')) {
                nftCount = 3;
                bestDiscount = 30;
                discountType = 'Platinum NFT Holder';
            }
            else if (addressLower.includes('888') || addressLower.includes('999')) {
                nftCount = 2;
                bestDiscount = 20;
                discountType = 'Gold NFT Holder';
            }
            else if (addressLower.includes('777') || addressLower.includes('aaa')) {
                nftCount = 1;
                bestDiscount = 10;
                discountType = 'Silver NFT Holder';
            }
            // Random chance for other wallets to get tiered token discount
            else if (Math.random() > 0.6) {
                const rand = Math.random();
                if (rand > 0.8) {
                    tokenValueEUR = 500 + Math.random() * 500; // €500-1000
                    bestDiscount = 30;
                    discountType = 'Token Holder (€500+)';
                } else if (rand > 0.5) {
                    tokenValueEUR = 250 + Math.random() * 250; // €250-500
                    bestDiscount = 20;
                    discountType = 'Token Holder (€250+)';
                } else {
                    tokenValueEUR = 150 + Math.random() * 100; // €150-250
                    bestDiscount = 10;
                    discountType = 'Token Holder (€150+)';
                }
            }
            
            console.log(`Demo results - NFTs: ${nftCount}, Token Value: €${tokenValueEUR.toFixed(2)}, Discount: ${bestDiscount}%`);
            
            // Update UI based on results
            if (bestDiscount > 0) {
                statusEl.innerHTML = `🎉 ${discountType}: ${bestDiscount}% off!<br><small>NFTs: ${nftCount} | Tokens: €${tokenValueEUR.toFixed(2)}</small>`;
                connectBtn.textContent = `Apply ${bestDiscount}% Discount`;
                connectBtn.onclick = () => this.applyDiscount(bestDiscount);
            } else {
                statusEl.innerHTML = `💡 No discount available<br><small>NFTs: ${nftCount} | Tokens: €${tokenValueEUR.toFixed(2)} (need €150+ for discounts)</small><br><a href="https://havanaelephant.com" style="color: #90ee90;">Buy HVNA tokens</a>`;
                connectBtn.textContent = 'No Discount Available';
            }
            
        } catch (error) {
            console.error('Verification failed:', error);
            statusEl.innerHTML = `❌ Verification failed: ${error.message.substring(0, 50)}...`;
            connectBtn.textContent = 'Verify Holdings';
        }
        
        connectBtn.disabled = false;
    }
    
    applyDiscount(percent) {
        const statusEl = document.getElementById('hvna-status');
        const connectBtn = document.querySelector('#hvna-widget button');
        
        // Generate discount code
        const discountCode = `HVNA${percent}${this.userAddress.slice(-4).toUpperCase()}`;
        
        // Show discount code to user
        statusEl.innerHTML = `🎫 Discount Code: <strong style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${discountCode}</strong><br><small>Copy and apply at checkout</small>`;
        
        connectBtn.textContent = '✅ Discount Applied';
        connectBtn.disabled = true;
        
        // Auto-copy to clipboard if possible
        if (navigator.clipboard) {
            navigator.clipboard.writeText(discountCode).then(() => {
                console.log('Discount code copied to clipboard');
                statusEl.innerHTML = `🎫 Discount Code: <strong style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${discountCode}</strong><br><small>✅ Copied to clipboard!</small>`;
            }).catch(() => {
                console.log('Clipboard copy failed');
            });
        }
    }
}

// Initialize widget when page loads
let hvnaWidget;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing HVNA widget...');
    hvnaWidget = new ShopifyHVNAWidget();
    hvnaWidget.initialize();
});

// Also try immediate initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Document still loading, use DOMContentLoaded
} else {
    // Document already loaded
    console.log('Document already loaded, initializing HVNA widget immediately...');
    hvnaWidget = new ShopifyHVNAWidget();
    hvnaWidget.initialize();
}