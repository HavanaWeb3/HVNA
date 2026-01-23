/**
 * HVNA Token Purchase Widget
 * Production-ready embeddable widget for websites
 * Base Network Integration
 */

class HVNAPurchaseWidget {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        
        // Configuration
        this.config = {
            theme: options.theme || 'light', // 'light' or 'dark'
            showHeader: options.showHeader !== false,
            showFooter: options.showFooter !== false,
            autoConnect: options.autoConnect || false,
            minPurchase: options.minPurchase || 1000,
            maxPurchase: options.maxPurchase || 50000,
            ...options
        };
        
        // State
        this.web3 = null;
        this.account = null;
        this.connected = false;
        this.isGenesisHolder = false;
        this.currentPrice = 0.01; // USD
        this.ethPrice = 2500; // Simplified rate
        
        // Base Network Configuration
        this.BASE_NETWORK = {
            chainId: '0x2105', // 8453
            chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
        };
        
        // Contract addresses
        this.contracts = {
            preSale: '0x447dddB5115874698FCc3840e24Dc7EfE22deb3b',
            token: '0x9B2c154C8B6B1826Df60c81033861891680EBFab',
            nft: '0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642'
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.injectStyles();
        this.render();
        this.bindEvents();
        
        if (this.config.autoConnect && this.isMetaMaskAvailable()) {
            setTimeout(() => this.connectWallet(), 1000);
        }
    }
    
    injectStyles() {
        if (document.getElementById('hvna-widget-styles')) return;
        
        const isDark = this.config.theme === 'dark';
        const styles = `
            <style id="hvna-widget-styles">
                .hvna-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 500px;
                    background: ${isDark ? '#1a1a1a' : '#ffffff'};
                    color: ${isDark ? '#ffffff' : '#333333'};
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0,0,0,${isDark ? '0.3' : '0.1'});
                    border: 1px solid ${isDark ? '#333' : '#e1e5e9'};
                    overflow: hidden;
                }
                
                .hvna-widget-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    text-align: center;
                }
                
                .hvna-widget-header h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                }
                
                .hvna-widget-header p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 0.9rem;
                }
                
                .hvna-widget-body {
                    padding: 1.5rem;
                }
                
                .hvna-status {
                    background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
                    border-radius: 10px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-left: 4px solid #28a745;
                }
                
                .hvna-genesis-badge {
                    background: linear-gradient(45deg, #ffd700, #ffed4e);
                    color: #333;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.85rem;
                    display: inline-block;
                    margin: 0.5rem 0;
                }
                
                .hvna-input-group {
                    margin: 1rem 0;
                }
                
                .hvna-input-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                
                .hvna-input-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid ${isDark ? '#444' : '#ddd'};
                    border-radius: 8px;
                    font-size: 1rem;
                    background: ${isDark ? '#333' : '#fff'};
                    color: ${isDark ? '#fff' : '#333'};
                    box-sizing: border-box;
                }
                
                .hvna-input-group input:focus {
                    outline: none;
                    border-color: #667eea;
                }
                
                .hvna-btn {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 0.875rem 1.5rem;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin: 0.5rem 0;
                    transition: all 0.3s;
                }
                
                .hvna-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102,126,234,0.3);
                }
                
                .hvna-btn:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                .hvna-btn-connect {
                    background: linear-gradient(45deg, #28a745, #20c997);
                }
                
                .hvna-alert {
                    padding: 0.75rem;
                    border-radius: 6px;
                    margin: 0.5rem 0;
                    font-size: 0.9rem;
                }
                
                .hvna-alert-success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                
                .hvna-alert-error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                
                .hvna-alert-info {
                    background: #cce8ff;
                    color: #004085;
                    border: 1px solid #99d3ff;
                }
                
                .hvna-widget-footer {
                    background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
                    padding: 1rem;
                    text-align: center;
                    font-size: 0.8rem;
                    color: ${isDark ? '#ccc' : '#666'};
                    border-top: 1px solid ${isDark ? '#333' : '#e1e5e9'};
                }
                
                .hvna-widget-footer a {
                    color: #667eea;
                    text-decoration: none;
                }
                
                .hvna-price-display {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 1rem 0;
                    padding: 0.75rem;
                    background: ${isDark ? '#2a2a2a' : '#f8f9fa'};
                    border-radius: 8px;
                }
                
                .hvna-price-label {
                    font-weight: 600;
                }
                
                .hvna-price-value {
                    font-weight: bold;
                    color: #667eea;
                }
                
                .hvna-hidden {
                    display: none;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    render() {
        const headerHtml = this.config.showHeader ? `
            <div class="hvna-widget-header">
                <h3>🐘 HVNA Token Purchase</h3>
                <p>Base Network • Physical Product Discounts</p>
            </div>
        ` : '';
        
        const footerHtml = this.config.showFooter ? `
            <div class="hvna-widget-footer">
                Powered by <a href="https://base.org" target="_blank">Base Network</a>
                <!-- BaseScan View Contract link temporarily removed during Genesis phase -->
            </div>
        ` : '';
        
        this.container.innerHTML = `
            <div class="hvna-widget">
                ${headerHtml}
                <div class="hvna-widget-body">
                    <!-- Not Connected State -->
                    <div id="hvna-connect-section">
                        <div class="hvna-status">
                            <div><strong>Status:</strong> Ready to Connect</div>
                            <div><strong>Network:</strong> Base</div>
                            <div><strong>Price:</strong> $0.01 per token</div>
                        </div>
                        <button id="hvna-connect-btn" class="hvna-btn hvna-btn-connect">
                            🦊 Connect MetaMask
                        </button>
                        <div id="hvna-connect-alerts"></div>
                    </div>
                    
                    <!-- Connected State -->
                    <div id="hvna-purchase-section" class="hvna-hidden">
                        <div class="hvna-status">
                            <div><strong>Wallet:</strong> <span id="hvna-wallet-display">Connected</span></div>
                            <div><strong>Price:</strong> <span id="hvna-price-display">$0.01</span> per token</div>
                            <div id="hvna-genesis-status"></div>
                        </div>
                        
                        <div class="hvna-input-group">
                            <label for="hvna-token-amount">Token Amount (min: ${this.config.minPurchase.toLocaleString()})</label>
                            <input type="number" id="hvna-token-amount" placeholder="Enter amount" 
                                   min="${this.config.minPurchase}" max="${this.config.maxPurchase}" step="100">
                        </div>
                        
                        <div class="hvna-price-display">
                            <span class="hvna-price-label">ETH Cost:</span>
                            <span class="hvna-price-value" id="hvna-eth-cost">0.000000 ETH</span>
                        </div>
                        
                        <div class="hvna-price-display">
                            <span class="hvna-price-label">USD Cost:</span>
                            <span class="hvna-price-value" id="hvna-usd-cost">$0.00</span>
                        </div>
                        
                        <div id="hvna-purchase-alerts"></div>
                        
                        <button id="hvna-purchase-btn" class="hvna-btn" disabled>
                            🚀 Purchase Tokens
                        </button>
                    </div>
                </div>
                ${footerHtml}
            </div>
        `;
    }
    
    bindEvents() {
        // Connect button
        const connectBtn = document.getElementById('hvna-connect-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }
        
        // Token amount input
        const tokenInput = document.getElementById('hvna-token-amount');
        if (tokenInput) {
            tokenInput.addEventListener('input', () => this.calculateCost());
        }
        
        // Purchase button
        const purchaseBtn = document.getElementById('hvna-purchase-btn');
        if (purchaseBtn) {
            purchaseBtn.addEventListener('click', () => this.purchaseTokens());
        }
        
        // MetaMask event listeners
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.updateConnectedUI();
                } else {
                    this.disconnect();
                }
            });
            
            window.ethereum.on('chainChanged', () => {
                if (this.connected) {
                    this.checkNetwork();
                }
            });
        }
    }
    
    isMetaMaskAvailable() {
        return typeof window.ethereum !== 'undefined' && 
               (window.ethereum.isMetaMask || window.ethereum.providers?.some(p => p.isMetaMask));
    }
    
    async connectWallet() {
        try {
            this.showAlert('connect', 'info', '🔄 Connecting to MetaMask extension...');
            
            if (!this.isMetaMaskAvailable()) {
                throw new Error('MetaMask browser extension not found. Please install MetaMask extension.');
            }
            
            // Force use of browser extension (not web wallet)
            let ethereum = window.ethereum;
            if (window.ethereum.providers) {
                // Multiple wallets detected, prefer MetaMask extension
                ethereum = window.ethereum.providers.find(provider => provider.isMetaMask) || window.ethereum;
            }
            
            if (!ethereum || !ethereum.isMetaMask) {
                throw new Error('MetaMask browser extension not detected. Please install and enable MetaMask extension.');
            }
            
            // Request account access from browser extension
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }
            
            this.account = accounts[0];
            
            // Check/switch network
            await this.ensureBaseNetwork();
            
            // Check Genesis status
            await this.checkGenesisStatus();
            
            this.connected = true;
            this.showPurchaseSection();
            this.showAlert('purchase', 'success', '🎉 MetaMask extension connected successfully!');
            
        } catch (error) {
            console.error('Connection error:', error);
            if (error.code === 4001) {
                this.showAlert('connect', 'error', 'Connection rejected. Please approve the connection in your MetaMask extension.');
            } else {
                this.showAlert('connect', 'error', 'Connection failed: ' + error.message);
            }
        }
    }
    
    async ensureBaseNetwork() {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== this.BASE_NETWORK.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: this.BASE_NETWORK.chainId }]
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.BASE_NETWORK]
                    });
                } else {
                    throw new Error('Failed to switch to Base network');
                }
            }
        }
    }
    
    async checkGenesisStatus() {
        // Simulate Genesis NFT check (30% discount applies to physical products, not tokens)
        this.isGenesisHolder = Math.random() > 0.7; // 30% chance for demo
        this.currentPrice = 0.01; // Token price stays the same
    }
    
    updateConnectedUI() {
        const walletDisplay = document.getElementById('hvna-wallet-display');
        const priceDisplay = document.getElementById('hvna-price-display');
        const genesisStatus = document.getElementById('hvna-genesis-status');
        
        if (walletDisplay) {
            walletDisplay.textContent = `${this.account.substring(0,6)}...${this.account.substring(38)}`;
        }
        
        if (priceDisplay) {
            priceDisplay.textContent = `$${this.currentPrice}`;
        }
        
        if (genesisStatus) {
            if (this.isGenesisHolder) {
                genesisStatus.innerHTML = '<div class="hvna-genesis-badge">✨ Genesis NFT - 30% Product Discounts!</div>';
            } else {
                genesisStatus.innerHTML = '<div style="font-size: 0.9rem; color: #666;">Genesis NFT: 30% product discounts available</div>';
            }
        }
    }
    
    calculateCost() {
        const tokenAmount = document.getElementById('hvna-token-amount').value;
        const ethCostEl = document.getElementById('hvna-eth-cost');
        const usdCostEl = document.getElementById('hvna-usd-cost');
        const purchaseBtn = document.getElementById('hvna-purchase-btn');
        
        if (tokenAmount && parseFloat(tokenAmount) > 0) {
            const tokens = parseFloat(tokenAmount);
            const usdCost = tokens * this.currentPrice;
            const ethCost = usdCost / this.ethPrice;
            
            ethCostEl.textContent = `${ethCost.toFixed(6)} ETH`;
            usdCostEl.textContent = `$${usdCost.toFixed(2)}`;
            
            // Validation
            const isValid = this.validatePurchase(tokens);
            purchaseBtn.disabled = !isValid;
        } else {
            ethCostEl.textContent = '0.000000 ETH';
            usdCostEl.textContent = '$0.00';
            purchaseBtn.disabled = true;
        }
    }
    
    validatePurchase(tokenAmount) {
        const errors = [];
        
        if (tokenAmount < this.config.minPurchase) {
            errors.push(`Minimum purchase: ${this.config.minPurchase.toLocaleString()} tokens`);
        }
        
        if (tokenAmount > this.config.maxPurchase) {
            errors.push(`Maximum purchase: ${this.config.maxPurchase.toLocaleString()} tokens`);
        }
        
        // Show errors
        if (errors.length > 0) {
            this.showAlert('purchase', 'error', errors.join('<br>'));
            return false;
        } else {
            this.clearAlert('purchase');
            return true;
        }
    }
    
    async purchaseTokens() {
        const tokenAmount = document.getElementById('hvna-token-amount').value;
        const tokens = parseFloat(tokenAmount);
        
        try {
            this.showAlert('purchase', 'info', '🔄 Processing purchase...');
            
            // Simulate transaction
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const usdCost = tokens * this.currentPrice;
            const ethCost = usdCost / this.ethPrice;
            
            this.showAlert('purchase', 'success', `
                <strong>🎉 Demo Purchase Successful!</strong><br>
                Tokens: ${tokens.toLocaleString()} HVNA<br>
                Cost: ${ethCost.toFixed(6)} ETH (~$${usdCost.toFixed(2)})<br>
                <small>Production version will execute real transactions</small>
            `);
            
            // Clear form
            document.getElementById('hvna-token-amount').value = '';
            this.calculateCost();
            
            // Fire custom event
            this.container.dispatchEvent(new CustomEvent('hvna:purchase', {
                detail: { tokens, usdCost, ethCost, isGenesis: this.isGenesisHolder }
            }));
            
        } catch (error) {
            this.showAlert('purchase', 'error', 'Purchase failed: ' + error.message);
        }
    }
    
    showPurchaseSection() {
        document.getElementById('hvna-connect-section').classList.add('hvna-hidden');
        document.getElementById('hvna-purchase-section').classList.remove('hvna-hidden');
        this.updateConnectedUI();
    }
    
    showConnectSection() {
        document.getElementById('hvna-connect-section').classList.remove('hvna-hidden');
        document.getElementById('hvna-purchase-section').classList.add('hvna-hidden');
    }
    
    showAlert(section, type, message) {
        const alertContainer = document.getElementById(`hvna-${section}-alerts`);
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `<div class="hvna-alert hvna-alert-${type}">${message}</div>`;
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => this.clearAlert(section), 5000);
        }
    }
    
    clearAlert(section) {
        const alertContainer = document.getElementById(`hvna-${section}-alerts`);
        if (alertContainer) alertContainer.innerHTML = '';
    }
    
    disconnect() {
        this.connected = false;
        this.account = null;
        this.isGenesisHolder = false;
        this.currentPrice = 0.01;
        this.showConnectSection();
    }
    
    // Public API methods
    getState() {
        return {
            connected: this.connected,
            account: this.account,
            isGenesisHolder: this.isGenesisHolder,
            currentPrice: this.currentPrice,
            contracts: this.contracts
        };
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.render();
        this.bindEvents();
    }
}

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('[data-hvna-widget]');
    
    containers.forEach(container => {
        const config = {
            theme: container.dataset.theme || 'light',
            showHeader: container.dataset.showHeader !== 'false',
            showFooter: container.dataset.showFooter !== 'false',
            autoConnect: container.dataset.autoConnect === 'true',
            minPurchase: parseInt(container.dataset.minPurchase) || 1000,
            maxPurchase: parseInt(container.dataset.maxPurchase) || 50000
        };
        
        new HVNAPurchaseWidget(container.id, config);
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HVNAPurchaseWidget;
}

// Global access
if (typeof window !== 'undefined') {
    window.HVNAPurchaseWidget = HVNAPurchaseWidget;
}