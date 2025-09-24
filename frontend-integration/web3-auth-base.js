// Web3 Authentication and Pre-Sale Integration for Havana Elephant on Base Network
// This module handles wallet connection, Genesis NFT verification, and USD-priced token pre-sale

class HavanaPreSaleAuthBase {
    constructor(contractAddresses) {
        this.contracts = contractAddresses;
        this.web3 = null;
        this.account = null;
        this.preSaleContract = null;
        this.nftContract = null;
        this.tokenContract = null;
        this.isGenesisHolder = false;
        this.userInfo = {};
        
        // Base Network Configuration
        this.BASE_NETWORK = {
            chainId: '0x2105', // 8453 in hex
            chainName: 'Base',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
        };
        
        // Contract ABIs for Base network
        this.preSaleABI = [
            "function buyTokens(uint256 tokenAmount) payable",
            "function isGenesisHolder(address user) view returns (bool)",
            "function getPreSaleInfo() view returns (uint8, uint256, uint256, uint256, uint256, uint256, bool, uint256, uint256, uint256)",
            "function getCurrentPrices(address user) view returns (uint256, uint256)",
            "function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) view returns (uint256, uint256)",
            "function getETHUSDPrice() view returns (uint256)",
            "function getRemainingTokens() view returns (uint256)"
        ];
        
        this.nftABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function ownerOf(uint256 tokenId) view returns (address)"
        ];
    }
    
    // Initialize Web3 connection
    async init() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            await this.setupContracts();
            return true;
        } else {
            throw new Error('MetaMask not found. Please install MetaMask to participate in the pre-sale.');
        }
    }
    
    // Setup contract instances
    async setupContracts() {
        if (!this.web3) throw new Error('Web3 not initialized');
        
        this.preSaleContract = new this.web3.eth.Contract(
            this.preSaleABI, 
            this.contracts.preSaleAddress
        );
        
        this.nftContract = new this.web3.eth.Contract(
            this.nftABI, 
            this.contracts.nftAddress
        );
    }
    
    // Connect wallet and switch to Base network
    async connectWallet() {
        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found. Please connect your wallet.');
            }
            
            this.account = accounts[0];
            
            // Switch to Base network
            await this.switchToBaseNetwork();
            
            // Authenticate Genesis holder status
            await this.authenticateGenesisHolder();
            
            // Get user pre-sale information
            await this.loadUserInfo();
            
            return {
                success: true,
                account: this.account,
                isGenesisHolder: this.isGenesisHolder,
                userInfo: this.userInfo
            };
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    }
    
    // Switch to Base network or add it if not present
    async switchToBaseNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.BASE_NETWORK.chainId }]
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.BASE_NETWORK]
                    });
                } catch (addError) {
                    throw new Error('Failed to add Base network to MetaMask');
                }
            } else {
                throw new Error('Failed to switch to Base network');
            }
        }
    }
    
    // Authenticate Genesis NFT holder
    async authenticateGenesisHolder() {
        try {
            if (!this.account) throw new Error('No account connected');
            
            // Check NFT balance on Base network
            const nftBalance = await this.nftContract.methods
                .balanceOf(this.account)
                .call();
            
            // Verify through pre-sale contract
            this.isGenesisHolder = await this.preSaleContract.methods
                .isGenesisHolder(this.account)
                .call();
            
            console.log(`Genesis authentication: ${this.isGenesisHolder ? 'VERIFIED' : 'NOT VERIFIED'}`);
            console.log(`NFT Balance: ${nftBalance}`);
            
            return {
                isGenesisHolder: this.isGenesisHolder,
                nftBalance: parseInt(nftBalance)
            };
            
        } catch (error) {
            console.error('Genesis authentication failed:', error);
            this.isGenesisHolder = false;
            return { isGenesisHolder: false, nftBalance: 0 };
        }
    }
    
    // Load user pre-sale information with USD pricing
    async loadUserInfo() {
        try {
            if (!this.account) throw new Error('No account connected');
            
            const preSaleInfo = await this.preSaleContract.methods
                .getPreSaleInfo()
                .call({ from: this.account });
            
            const prices = await this.preSaleContract.methods
                .getCurrentPrices(this.account)
                .call();
            
            const ethUsdRate = await this.preSaleContract.methods
                .getETHUSDPrice()
                .call();
            
            const remainingTokens = await this.preSaleContract.methods
                .getRemainingTokens()
                .call();
            
            this.userInfo = {
                phase: this.getPhaseString(preSaleInfo[0]),
                currentPriceETH: this.web3.utils.fromWei(prices[0], 'ether'),
                currentPriceUSD: (prices[1] / 100).toFixed(2), // Convert cents to dollars
                remainingTokens: this.web3.utils.fromWei(remainingTokens, 'ether'),
                userPurchased: this.web3.utils.fromWei(preSaleInfo[4], 'ether'),
                userMaxPurchase: this.web3.utils.fromWei(preSaleInfo[5], 'ether'),
                isGenesis: preSaleInfo[6],
                phaseStartTime: new Date(parseInt(preSaleInfo[7]) * 1000),
                phaseEndTime: new Date(parseInt(preSaleInfo[8]) * 1000),
                ethUsdRate: (parseInt(ethUsdRate) / 10**8).toFixed(2)
            };
            
            return this.userInfo;
            
        } catch (error) {
            console.error('Failed to load user info:', error);
            return {};
        }
    }
    
    // Purchase tokens with dynamic USD-to-ETH conversion
    async purchaseTokens(tokenAmount) {
        try {
            if (!this.account) throw new Error('No account connected');
            
            const tokenAmountWei = this.web3.utils.toWei(tokenAmount.toString(), 'ether');
            const isGenesis = this.isGenesisHolder;
            
            // Get current pricing
            const costs = await this.preSaleContract.methods
                .calculatePurchaseCost(tokenAmountWei, isGenesis)
                .call();
            
            const ethCost = costs[0];
            const usdCost = costs[1];
            
            console.log(`Purchase: ${tokenAmount} tokens`);
            console.log(`Cost: ${this.web3.utils.fromWei(ethCost, 'ether')} ETH ($${usdCost})`);
            console.log(`Genesis holder: ${isGenesis}`);
            
            // Estimate gas
            const gasEstimate = await this.preSaleContract.methods
                .buyTokens(tokenAmountWei)
                .estimateGas({
                    from: this.account,
                    value: ethCost
                });
            
            // Execute purchase
            const transaction = await this.preSaleContract.methods
                .buyTokens(tokenAmountWei)
                .send({
                    from: this.account,
                    value: ethCost,
                    gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
                });
            
            // Refresh user info after purchase
            await this.loadUserInfo();
            
            return {
                success: true,
                transactionHash: transaction.transactionHash,
                tokenAmount: tokenAmount,
                ethCost: this.web3.utils.fromWei(ethCost, 'ether'),
                usdCost: usdCost,
                gasUsed: transaction.gasUsed,
                blockExplorer: `https://basescan.org/tx/${transaction.transactionHash}`
            };
            
        } catch (error) {
            console.error('Token purchase failed:', error);
            throw error;
        }
    }
    
    // Calculate purchase cost in both ETH and USD
    async calculatePurchaseCost(tokenAmount) {
        if (!tokenAmount || tokenAmount <= 0) return { eth: '0', usd: '0' };
        
        try {
            const tokenAmountWei = this.web3.utils.toWei(tokenAmount.toString(), 'ether');
            const isGenesis = this.isGenesisHolder;
            
            const costs = await this.preSaleContract.methods
                .calculatePurchaseCost(tokenAmountWei, isGenesis)
                .call();
            
            return {
                eth: parseFloat(this.web3.utils.fromWei(costs[0], 'ether')).toFixed(6),
                usd: costs[1].toString()
            };
        } catch (error) {
            console.error('Cost calculation failed:', error);
            return { eth: '0', usd: '0' };
        }
    }
    
    // Validate purchase amount
    validatePurchase(tokenAmount) {
        const amount = parseFloat(tokenAmount);
        const errors = [];
        
        if (amount <= 0) {
            errors.push('Token amount must be greater than 0');
        }
        
        if (amount < 1000) {
            errors.push('Minimum purchase: 1,000 tokens');
        }
        
        if (this.userInfo.userPurchased) {
            const maxAllowed = parseFloat(this.userInfo.userMaxPurchase) - parseFloat(this.userInfo.userPurchased);
            if (amount > maxAllowed) {
                errors.push(`Exceeds remaining purchase limit: ${maxAllowed.toLocaleString()} tokens`);
            }
        }
        
        if (this.userInfo.remainingTokens && amount > parseFloat(this.userInfo.remainingTokens)) {
            errors.push(`Exceeds available tokens: ${parseFloat(this.userInfo.remainingTokens).toLocaleString()}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    // Helper functions
    getPhaseString(phaseNumber) {
        const phases = ['Genesis', 'Public', 'Ended'];
        return phases[phaseNumber] || 'Unknown';
    }
    
    // Listen to account and network changes
    setupEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    await this.authenticateGenesisHolder();
                    await this.loadUserInfo();
                } else {
                    this.disconnect();
                }
            });
            
            window.ethereum.on('chainChanged', async (chainId) => {
                if (chainId !== this.BASE_NETWORK.chainId) {
                    // Switched away from Base network
                    console.warn('Switched away from Base network');
                    await this.switchToBaseNetwork();
                } else {
                    // Refresh data when back on Base
                    await this.loadUserInfo();
                }
            });
        }
    }
    
    // Disconnect wallet
    disconnect() {
        this.account = null;
        this.isGenesisHolder = false;
        this.userInfo = {};
    }
    
    // Get formatted user status for UI
    getUserStatus() {
        return {
            connected: !!this.account,
            account: this.account,
            network: 'Base',
            isGenesisHolder: this.isGenesisHolder,
            currentPhase: this.userInfo.phase || 'Unknown',
            discountEligible: this.isGenesisHolder,
            discountAmount: this.isGenesisHolder ? '30%' : '0%',
            pricePerTokenETH: this.userInfo.currentPriceETH || '0',
            pricePerTokenUSD: this.userInfo.currentPriceUSD || '0.01',
            tokensRemaining: this.userInfo.remainingTokens || '0',
            userPurchased: this.userInfo.userPurchased || '0',
            maxPurchaseRemaining: this.userInfo.userMaxPurchase ? 
                (parseFloat(this.userInfo.userMaxPurchase) - parseFloat(this.userInfo.userPurchased || 0)).toString() : '0',
            ethUsdRate: this.userInfo.ethUsdRate || 'Loading...'
        };
    }
    
    // Get current ETH/USD rate for display
    async getCurrentETHUSDRate() {
        try {
            const rate = await this.preSaleContract.methods.getETHUSDPrice().call();
            return (parseInt(rate) / 10**8).toFixed(2);
        } catch (error) {
            console.error('Failed to get ETH/USD rate:', error);
            return 'N/A';
        }
    }
}

// Base Network Contract Configuration
const HAVANA_CONTRACTS_BASE = {
    preSaleAddress: '0x447dddB5115874698FCc3840e24Dc7EfE22deb3b',
    nftAddress: '0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642',
    tokenAddress: '0x9B2c154C8B6B1826Df60c81033861891680EBFab',
    chainId: '0x2105', // Base mainnet
    networkName: 'Base'
};

// Export for use in your frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HavanaPreSaleAuthBase, HAVANA_CONTRACTS_BASE };
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.HavanaPreSaleAuthBase = HavanaPreSaleAuthBase;
    window.HAVANA_CONTRACTS_BASE = HAVANA_CONTRACTS_BASE;
}