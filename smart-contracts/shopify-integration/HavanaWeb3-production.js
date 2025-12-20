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
                nft: "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642", // Original Genesis collection (compromised wallet)
                newNft: "0x815D1bfaF945aCa39049FF243D6E406e2aEc3ff5", // New Boldly Elephunky Genesis collection
                token: "0x72a2310fc7422ddC3939a481A1211ce5e0113fd6", // Secure token contract
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
        // Create main widget container - VERTICAL RIGHT-SIDE BANNER
        const widget = document.createElement('div');
        widget.id = 'hvna-widget';

        // Vertical banner styling with on-brand colors
        widget.style.background = 'linear-gradient(135deg, #FF6B4A, #E91E8C)'; // Vibrant orange to hot pink
        widget.style.color = 'white';
        widget.style.padding = '20px 15px';
        widget.style.borderRadius = '12px 0 0 12px'; // Rounded on left side only
        widget.style.textAlign = 'center';
        widget.style.fontWeight = 'bold';
        widget.style.boxShadow = '-4px 0 15px rgba(255, 107, 74, 0.4)';

        // Fixed positioning on right edge
        widget.style.position = 'fixed';
        widget.style.right = '0';
        widget.style.top = '50%';
        widget.style.transform = 'translateY(-50%)';
        widget.style.zIndex = '9998'; // Below typical modals but above content
        widget.style.maxWidth = '200px'; // Narrower for vertical display
        widget.style.minWidth = '180px';

        // Responsive behavior
        widget.style.transition = 'all 0.3s ease';

        // Create widget content
        const content = document.createElement('div');

        // Title
        const title = document.createElement('div');
        title.textContent = '🐘 Web3 Holder Discounts';
        title.style.fontSize = '1.1rem';
        title.style.marginBottom = '12px';
        title.style.lineHeight = '1.3';

        // Benefits text with updated discount structure - COMPACT VERSION
        const benefits = document.createElement('div');
        benefits.innerHTML = `
            <div style="font-size: 0.75rem; opacity: 0.95; margin-bottom: 12px; line-height: 1.4;">
                <div style="margin-bottom: 6px;"><strong>NFT holders up to 50% off!</strong></div>
                <div style="margin-bottom: 4px;">Token holders: $150+=10%, $300+=20%, $500+=30%</div>
            </div>
        `;

        // Connect button - COMPACT
        const connectBtn = document.createElement('button');
        connectBtn.textContent = 'Connect Wallet';
        connectBtn.style.background = 'white';
        connectBtn.style.color = '#E91E8C'; // Hot pink text
        connectBtn.style.border = 'none';
        connectBtn.style.padding = '10px 16px';
        connectBtn.style.borderRadius = '6px';
        connectBtn.style.fontSize = '0.9rem';
        connectBtn.style.fontWeight = '600';
        connectBtn.style.cursor = 'pointer';
        connectBtn.style.transition = 'all 0.3s ease';
        connectBtn.style.width = '100%';
        connectBtn.style.marginTop = '8px';

        // Button hover effects
        connectBtn.onmouseover = function() {
            this.style.background = '#FFE5E0'; // Light pink on hover
            this.style.transform = 'scale(1.05)';
        };
        connectBtn.onmouseout = function() {
            this.style.background = 'white';
            this.style.transform = 'scale(1)';
        };

        // Button click handler
        connectBtn.onclick = () => this.connectWallet();

        // Status message area - COMPACT
        const statusArea = document.createElement('div');
        statusArea.id = 'hvna-status';
        statusArea.style.marginTop = '12px';
        statusArea.style.fontSize = '0.75rem';
        statusArea.style.minHeight = '16px';
        statusArea.style.lineHeight = '1.3';

        // Network indicator - COMPACT
        const networkIndicator = document.createElement('div');
        networkIndicator.id = 'hvna-network';
        networkIndicator.style.marginTop = '8px';
        networkIndicator.style.fontSize = '0.7rem';
        networkIndicator.style.opacity = '0.7';
        networkIndicator.textContent = `${this.selectedNetwork.charAt(0).toUpperCase() + this.selectedNetwork.slice(1)}`;

        // Assemble widget
        content.appendChild(title);
        content.appendChild(benefits);
        content.appendChild(connectBtn);
        content.appendChild(statusArea);
        content.appendChild(networkIndicator);
        widget.appendChild(content);

        // Add responsive media query via style element
        const style = document.createElement('style');
        style.textContent = `
            /* Hide banner on mobile/tablet to avoid covering content */
            @media (max-width: 768px) {
                #hvna-widget {
                    display: none !important;
                }
            }

            /* Smaller version for medium screens */
            @media (min-width: 769px) and (max-width: 1024px) {
                #hvna-widget {
                    max-width: 160px !important;
                    font-size: 0.9em;
                }
            }

            /* Optional: Add a small tab when collapsed on mobile */
            @media (max-width: 768px) {
                #hvna-widget-mobile-tab {
                    display: block !important;
                    position: fixed;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    background: linear-gradient(135deg, #FF6B4A, #E91E8C);
                    color: white;
                    padding: 8px 4px;
                    border-radius: 6px 0 0 6px;
                    font-size: 0.7rem;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 9997;
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
            }
        `;
        document.head.appendChild(style);

        // Insert widget at body level (for fixed positioning)
        document.body.appendChild(widget);

        console.log('HVNA Production Widget created and inserted (Vertical Right-Side Banner)');
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
        let totalNfts = 0;
        
        // Check original collection
        const oldNftAddress = this.contracts[this.selectedNetwork].nft;
        if (oldNftAddress) {
            totalNfts += await this.checkNFTBalanceFromContract(oldNftAddress);
        }
        
        // Check new Boldly Elephunky Genesis collection
        const newNftAddress = this.contracts[this.selectedNetwork].newNft;
        if (newNftAddress && newNftAddress !== "YOUR_BOLDLY_ELEPHUNKY_GENESIS_CONTRACT") {
            totalNfts += await this.checkNFTBalanceFromContract(newNftAddress);
        }
        
        return totalNfts;
    }
    
    async checkNFTBalanceFromContract(nftAddress) {
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
        // Check both old Genesis collection and new Boldly Elephunky Genesis
        const oldNftAddress = this.contracts[this.selectedNetwork].nft;
        const newNftAddress = this.contracts[this.selectedNetwork].newNft;
        
        let totalGenesis = 0;
        
        // Check original Genesis collection (if accessible)
        if (oldNftAddress) {
            totalGenesis += await this.checkGenesisBalanceFromContract(oldNftAddress);
        }
        
        // Check new Boldly Elephunky Genesis collection
        if (newNftAddress && newNftAddress !== "YOUR_BOLDLY_ELEPHUNKY_GENESIS_CONTRACT") {
            totalGenesis += await this.checkGenesisBalanceFromContract(newNftAddress);
        }
        
        return totalGenesis;
    }
    
    async checkGenesisBalanceFromContract(nftAddress) {
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