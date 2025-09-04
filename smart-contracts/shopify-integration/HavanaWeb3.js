// HVNA Shopify Widget - Connect Wallet for Discount
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
            statusEl.textContent = '🔍 Checking NFT and token holdings...';
            
            // Check if ethers is available
            if (typeof ethers === 'undefined') {
                throw new Error('Ethers.js library not loaded');
            }
            
            // Contract addresses on Sepolia (will auto-switch network)
            const NFT_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
            const TOKEN_ADDRESS = "0x9a0dcE791C7B61647a12266de77a6a1149889f56";
            const SEPOLIA_CHAIN_ID = 11155111;
            
            // Contract ABIs
            const NFT_ABI = [
                "function balanceOf(address owner) external view returns (uint256)"
            ];
            const TOKEN_ABI = [
                "function balanceOf(address account) external view returns (uint256)",
                "function decimals() external view returns (uint8)"
            ];
            
            // Check and switch to Sepolia network
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log('Current network chain ID:', currentChainId);
            
            if (parseInt(currentChainId, 16) !== SEPOLIA_CHAIN_ID) {
                statusEl.textContent = '🔄 Switching to Sepolia testnet...';
                
                try {
                    // Try to switch to Sepolia
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
                    });
                } catch (switchError) {
                    console.error('Switch error:', switchError);
                    
                    // If Sepolia is not added, add it
                    if (switchError.code === 4902) {
                        statusEl.textContent = '➕ Adding Sepolia network...';
                        
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0xaa36a7',
                                chainName: 'Sepolia test network',
                                nativeCurrency: { 
                                    name: 'SepoliaETH', 
                                    symbol: 'ETH', 
                                    decimals: 18 
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io/']
                            }]
                        });
                    } else if (switchError.code === 4001) {
                        throw new Error('User rejected network switch');
                    } else {
                        throw switchError;
                    }
                }
                
                statusEl.textContent = '✅ Connected to Sepolia. Checking holdings...';
            }
            
            // Create provider and contracts
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
            
            statusEl.textContent = '🔍 Checking NFT balance...';
            
            // Check NFT balance
            const nftBalance = await nftContract.balanceOf(this.userAddress);
            const nftCount = nftBalance.toNumber();
            
            statusEl.textContent = '🔍 Checking token balance...';
            
            // Check token balance
            const tokenBalance = await tokenContract.balanceOf(this.userAddress);
            const decimals = await tokenContract.decimals();
            const tokenAmount = parseFloat(ethers.utils.formatUnits(tokenBalance, decimals));
            
            // Calculate EUR value (1 HVNA = €0.01)
            const tokenValueEUR = tokenAmount * 0.01;
            
            console.log(`NFTs: ${nftCount}, Tokens: ${tokenAmount} HVNA (€${tokenValueEUR.toFixed(2)})`);
            
            // Determine discount
            let bestDiscount = 0;
            let discountType = '';
            
            if (nftCount > 0) {
                // NFT holder - simplified tier system for demo
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
                // Token holder with 150+ EUR worth
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
            console.error('Error details:', error.message, error.code);
            
            // Show user-friendly error message with more details
            if (error.message.includes('Ethers.js library not loaded')) {
                statusEl.textContent = '❌ Web3 library loading. Please refresh the page.';
            } else if (error.message.includes('User rejected')) {
                statusEl.textContent = '❌ Network switch rejected. Please approve in MetaMask.';
            } else if (error.message.includes('network') || error.code === -32603) {
                statusEl.innerHTML = '❌ Network connection issue. Check MetaMask network.';
            } else {
                statusEl.innerHTML = `❌ Error: ${error.message.substring(0, 50)}...`;
            }
            
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