// HVNA Shopify Widget - Simple Version
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
        benefits.textContent = 'NFT holders up to 50% off | Token holders (€150+) 10% off';
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
            statusEl.textContent = '🔍 Verifying wallet holdings...';
            
            // Switch to Sepolia if needed
            await this.ensureSepoliaNetwork();
            
            // Use raw contract calls to avoid ethers compatibility issues
            const nftCount = await this.checkNFTBalance();
            const tokenValueEUR = await this.checkTokenBalance();
            
            console.log(`NFTs: ${nftCount}, Token Value: €${tokenValueEUR.toFixed(2)}`);
            
            // Determine discount
            let bestDiscount = 0;
            let discountType = '';
            
            if (nftCount > 0) {
                // NFT holder discounts
                if (nftCount >= 3) {
                    bestDiscount = 50; // Platinum
                    discountType = 'Platinum NFT Holder';
                } else if (nftCount >= 2) {
                    bestDiscount = 25; // Gold
                    discountType = 'Gold NFT Holder';
                } else {
                    bestDiscount = 10; // Silver
                    discountType = 'Silver NFT Holder';
                }
            } else if (tokenValueEUR >= 150) {
                // Token holder discount
                bestDiscount = 10;
                discountType = 'Token Holder (€150+)';
            }
            
            // Update UI based on results
            if (bestDiscount > 0) {
                statusEl.innerHTML = `🎉 ${discountType}: ${bestDiscount}% off!<br><small>NFTs: ${nftCount} | Tokens: €${tokenValueEUR.toFixed(2)}</small>`;
                connectBtn.textContent = `Apply ${bestDiscount}% Discount`;
                connectBtn.onclick = () => this.applyDiscount(bestDiscount);
            } else {
                statusEl.innerHTML = `💡 No discount available<br><small>NFTs: ${nftCount} | Tokens: €${tokenValueEUR.toFixed(2)} (need €150+)</small><br><a href="https://havanaelephant.com" style="color: #90ee90;">Buy HVNA tokens</a>`;
                connectBtn.textContent = 'No Discount Available';
            }
            
        } catch (error) {
            console.error('Verification failed:', error);
            statusEl.innerHTML = `❌ Verification failed: ${error.message.substring(0, 50)}...`;
            connectBtn.textContent = 'Verify Holdings';
        }
        
        connectBtn.disabled = false;
    }
    
    async ensureSepoliaNetwork() {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const sepoliaChainId = '0xaa36a7'; // Sepolia chain ID
        
        if (currentChainId !== sepoliaChainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: sepoliaChainId,
                            chainName: 'Sepolia test network',
                            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://rpc.sepolia.org'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/']
                        }]
                    });
                } else {
                    throw switchError;
                }
            }
        }
    }
    
    async checkNFTBalance() {
        const nftAddress = "0xA292b4c3355dF1478Ef6Bad115008B211fEB838d";
        const balanceOfSignature = "0x70a08231"; // balanceOf(address)
        
        // Encode the address parameter (remove 0x, pad to 32 bytes)
        const addressParam = this.userAddress.slice(2).padStart(64, '0');
        const data = balanceOfSignature + addressParam;
        
        try {
            const result = await window.ethereum.request({
                method: 'eth_call',
                params: [{ to: nftAddress, data: data }, 'latest']
            });
            
            return parseInt(result, 16);
        } catch (error) {
            console.error('NFT balance check failed:', error);
            return 0;
        }
    }
    
    async checkTokenBalance() {
        const tokenAddress = "0x6351b9A1c1DD1F61187769D34Ce5Ea098B0B03d4";
        const balanceOfSignature = "0x70a08231"; // balanceOf(address)
        
        // Encode the address parameter
        const addressParam = this.userAddress.slice(2).padStart(64, '0');
        const data = balanceOfSignature + addressParam;
        
        try {
            const result = await window.ethereum.request({
                method: 'eth_call',
                params: [{ to: tokenAddress, data: data }, 'latest']
            });
            
            console.log('Raw token balance result:', result);
            
            // Convert result to token amount (assuming 18 decimals)
            const balance = parseInt(result, 16);
            console.log('Parsed balance:', balance);
            
            const tokenAmount = balance / Math.pow(10, 18);
            console.log('Token amount:', tokenAmount);
            
            // Convert to EUR (1 HVNA = €0.01)
            const eurValue = tokenAmount * 0.01;
            console.log('EUR value:', eurValue);
            
            return eurValue;
        } catch (error) {
            console.error('Token balance check failed:', error);
            return 0;
        }
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