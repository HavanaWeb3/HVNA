// HVNA Shopify Widget - Production Version with Real Blockchain Verification
class ShopifyHVNAWidget {
    constructor() {
        console.log('HVNA Production Widget created');
        this.isConnected = false;
        this.userAddress = null;
        this.currentNetwork = null;
        
        // Contract addresses - Updated for current deployment
        this.contracts = {
            sepolia: {
                nft: "0xc6846441c0915E8cc758189be4045057F5610a6c", // Enhanced NFT contract with Genesis support
                token: "0xc829420a702b849446886C99E36b507C04fDF3E0", // Current token contract
                chainId: 11155111,
                rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org']
            },
            base: {
                nft: "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642", // DEPLOYED! Enhanced NFT with Genesis support
                token: null, // Token deployment pending
                chainId: 8453,
                rpcUrls: ['https://mainnet.base.org']
            },
            polygon: {
                nft: null, // To be deployed
                token: null, // To be deployed
                chainId: 137,
                rpcUrls: ['https://polygon-rpc.com']
            }
        };
        
        // Default to Base for production
        this.selectedNetwork = 'base'; // LIVE ON BASE MAINNET!
    }
    
    initialize() {
        console.log('HVNA Production Widget initializing...');
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
        
        // Benefits text with updated discount structure
        const benefits = document.createElement('div');
        benefits.innerHTML = `
            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 15px;">
                <div><strong>Genesis NFT:</strong> 30% off (Ultimate tier)</div>
                <div><strong>NFT Holders:</strong> Silver 10% | Gold 20% | Platinum 30%</div>
                <div><strong>Token Holders:</strong> €150+ 10% | €250+ 20% | €500+ 30%</div>
            </div>
        `;
        
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
        
        // Network indicator
        const networkIndicator = document.createElement('div');
        networkIndicator.id = 'hvna-network';
        networkIndicator.style.marginTop = '10px';
        networkIndicator.style.fontSize = '0.8rem';
        networkIndicator.style.opacity = '0.7';
        networkIndicator.textContent = `Network: ${this.selectedNetwork.charAt(0).toUpperCase() + this.selectedNetwork.slice(1)}`;
        
        // Assemble widget
        content.appendChild(title);
        content.appendChild(benefits);
        content.appendChild(connectBtn);
        content.appendChild(statusArea);
        content.appendChild(networkIndicator);
        widget.appendChild(content);
        
        // Insert widget
        const target = document.querySelector('#hvna-discount-widget-container') || document.body;
        target.appendChild(widget);
        
        console.log('HVNA Production Widget created and inserted');
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
            
            // Check and switch to the correct network
            await this.ensureCorrectNetwork();
            
            // Check NFT and token balances
            const [nftBalance, genesisBalance, tokenBalance] = await Promise.all([
                this.checkNFTBalance(),
                this.checkGenesisBalance(),
                this.checkTokenBalance()
            ]);
            
            console.log(`Holdings - NFTs: ${nftBalance}, Genesis: ${genesisBalance}, Token Value: €${tokenBalance.toFixed(2)}`);
            
            // Determine discount tier
            const { discount, type, tier } = this.calculateDiscount(nftBalance, genesisBalance, tokenBalance);
            
            // Update UI based on results
            if (discount > 0) {
                statusEl.innerHTML = `🎉 ${type}: ${discount}% off!<br><small>${tier} | NFTs: ${nftBalance} (${genesisBalance} Genesis) | Tokens: €${tokenBalance.toFixed(2)}</small>`;
                connectBtn.textContent = `Apply ${discount}% Discount`;
                connectBtn.onclick = () => this.applyDiscount(discount, type);
            } else {
                statusEl.innerHTML = `💡 No discount available<br><small>NFTs: ${nftBalance} | Tokens: €${tokenBalance.toFixed(2)}</small><br><a href="https://havanaelephant.com" style="color: #90ee90;">Buy HVNA tokens or NFTs</a>`;
                connectBtn.textContent = 'No Discount Available';
            }
            
        } catch (error) {
            console.error('Verification failed:', error);
            
            // Show user-friendly error message
            if (error.message.includes('network')) {
                statusEl.innerHTML = '❌ Network connection issue. Please check MetaMask.';
            } else if (error.message.includes('rejected')) {
                statusEl.textContent = '❌ Network switch rejected. Please approve in MetaMask.';
            } else {
                statusEl.innerHTML = `❌ Verification failed: ${error.message.substring(0, 50)}...`;
            }
            
            connectBtn.textContent = 'Verify Holdings';
        }
        
        connectBtn.disabled = false;
    }
    
    async ensureCorrectNetwork() {
        const networkConfig = this.contracts[this.selectedNetwork];
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const targetChainId = '0x' + networkConfig.chainId.toString(16);
        
        if (parseInt(currentChainId, 16) !== networkConfig.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    // Network not added, add it
                    const networkData = this.getNetworkData(this.selectedNetwork);
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkData]
                    });
                } else {
                    throw switchError;
                }
            }
        }
    }
    
    getNetworkData(network) {
        const configs = {
            sepolia: {
                chainId: '0xaa36a7',
                chainName: 'Sepolia test network',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
            },
            base: {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org/']
            },
            polygon: {
                chainId: '0x89',
                chainName: 'Polygon',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://polygon-rpc.com'],
                blockExplorerUrls: ['https://polygonscan.com/']
            }
        };
        return configs[network];
    }
    
    async checkNFTBalance() {
        const nftAddress = this.contracts[this.selectedNetwork].nft;
        if (!nftAddress) return 0;
        
        const balanceOfSignature = "0x70a08231"; // balanceOf(address)
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
    
    async checkGenesisBalance() {
        const nftAddress = this.contracts[this.selectedNetwork].nft;
        if (!nftAddress) return 0;
        
        // Call genesisBalanceOf(address) function from enhanced contract
        // Function signature: genesisBalanceOf(address) -> uint256
        const genesisBalanceSignature = "0x70a08231"; // We'll use a different signature for genesisBalanceOf
        
        // Enhanced contract has genesisBalanceOf function
        // Function signature hash for genesisBalanceOf(address): 0x1e83409a
        const genesisBalanceOfSignature = "0x1e83409a";
        const addressParam = this.userAddress.slice(2).padStart(64, '0');
        const data = genesisBalanceOfSignature + addressParam;
        
        try {
            const result = await window.ethereum.request({
                method: 'eth_call',
                params: [{ to: nftAddress, data: data }, 'latest']
            });
            return parseInt(result, 16);
        } catch (error) {
            console.error('Genesis balance check failed, trying alternative method:', error);
            
            // Fallback: Check if user owns any tokens 1-100 (Genesis range)
            try {
                let genesisCount = 0;
                // Check ownership of first few Genesis tokens (this is expensive but works)
                for (let tokenId = 1; tokenId <= Math.min(10, 100); tokenId++) {
                    const ownerResult = await this.checkTokenOwnership(tokenId);
                    if (ownerResult && ownerResult.toLowerCase() === this.userAddress.toLowerCase()) {
                        genesisCount++;
                    }
                }
                return genesisCount;
            } catch (fallbackError) {
                console.error('Genesis fallback check failed:', fallbackError);
                return 0;
            }
        }
    }
    
    async checkTokenOwnership(tokenId) {
        const nftAddress = this.contracts[this.selectedNetwork].nft;
        if (!nftAddress) return null;
        
        // ownerOf(uint256) function signature: 0x6352211e
        const ownerOfSignature = "0x6352211e";
        const tokenIdParam = tokenId.toString(16).padStart(64, '0');
        const data = ownerOfSignature + tokenIdParam;
        
        try {
            const result = await window.ethereum.request({
                method: 'eth_call',
                params: [{ to: nftAddress, data: data }, 'latest']
            });
            
            // Extract address from result (last 40 characters)
            if (result && result !== '0x') {
                return '0x' + result.slice(-40);
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    
    async checkTokenBalance() {
        const tokenAddress = this.contracts[this.selectedNetwork].token;
        if (!tokenAddress) return 0;
        
        const balanceOfSignature = "0x70a08231"; // balanceOf(address)
        const addressParam = this.userAddress.slice(2).padStart(64, '0');
        const data = balanceOfSignature + addressParam;
        
        try {
            const result = await window.ethereum.request({
                method: 'eth_call',
                params: [{ to: tokenAddress, data: data }, 'latest']
            });
            
            const balance = parseInt(result, 16);
            const tokenAmount = balance / Math.pow(10, 18); // Assuming 18 decimals
            const eurValue = tokenAmount * 0.01; // 1 HVNA = €0.01
            
            return eurValue;
        } catch (error) {
            console.error('Token balance check failed:', error);
            return 0;
        }
    }
    
    calculateDiscount(nftBalance, genesisBalance, tokenValueEUR) {
        // Priority order: Genesis > NFT tiers > Token tiers
        
        if (genesisBalance > 0) {
            return { discount: 30, type: 'Genesis NFT Holder', tier: 'Ultimate' };
        }
        
        if (nftBalance > 0) {
            if (nftBalance >= 3) {
                return { discount: 30, type: 'Platinum NFT Holder', tier: 'Platinum' };
            } else if (nftBalance >= 2) {
                return { discount: 20, type: 'Gold NFT Holder', tier: 'Gold' };
            } else {
                return { discount: 10, type: 'Silver NFT Holder', tier: 'Silver' };
            }
        }
        
        if (tokenValueEUR >= 500) {
            return { discount: 30, type: 'Token Holder (€500+)', tier: 'Platinum' };
        } else if (tokenValueEUR >= 250) {
            return { discount: 20, type: 'Token Holder (€250+)', tier: 'Gold' };
        } else if (tokenValueEUR >= 150) {
            return { discount: 10, type: 'Token Holder (€150+)', tier: 'Silver' };
        }
        
        return { discount: 0, type: 'No discount available', tier: 'None' };
    }
    
    applyDiscount(percent, type) {
        const statusEl = document.getElementById('hvna-status');
        const connectBtn = document.querySelector('#hvna-widget button');
        
        // Generate discount code
        const discountCode = `HVNA${percent}${this.userAddress.slice(-4).toUpperCase()}`;
        
        // Show discount code to user
        statusEl.innerHTML = `🎫 Discount Code: <strong style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${discountCode}</strong><br><small>✅ ${type} verified on blockchain</small>`;
        
        connectBtn.textContent = '✅ Discount Applied';
        connectBtn.disabled = true;
        
        // Auto-copy to clipboard if possible
        if (navigator.clipboard) {
            navigator.clipboard.writeText(discountCode).then(() => {
                console.log('Discount code copied to clipboard');
                statusEl.innerHTML = `🎫 Discount Code: <strong style="font-family: monospace; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${discountCode}</strong><br><small>✅ Copied to clipboard! Valid: ${type}</small>`;
            }).catch(() => {
                console.log('Clipboard copy failed');
            });
        }
    }
    
    // Method to switch networks (can be called externally)
    switchNetwork(networkName) {
        if (this.contracts[networkName]) {
            this.selectedNetwork = networkName;
            const networkIndicator = document.getElementById('hvna-network');
            if (networkIndicator) {
                networkIndicator.textContent = `Network: ${networkName.charAt(0).toUpperCase() + networkName.slice(1)}`;
            }
            console.log(`Switched to ${networkName} network`);
        }
    }
}

// Initialize widget when page loads
let hvnaWidget;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing HVNA Production widget...');
    hvnaWidget = new ShopifyHVNAWidget();
    hvnaWidget.initialize();
});

// Also try immediate initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Document still loading, use DOMContentLoaded
} else {
    // Document already loaded
    console.log('Document already loaded, initializing HVNA Production widget immediately...');
    hvnaWidget = new ShopifyHVNAWidget();
    hvnaWidget.initialize();
}

// Expose widget globally for external control
window.HVNAWidget = hvnaWidget;