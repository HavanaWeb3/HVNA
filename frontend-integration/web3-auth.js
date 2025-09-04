// Web3 Authentication and Pre-Sale Integration for Havana Elephant
// This module handles wallet connection, Genesis NFT verification, and token pre-sale

class HavanaPreSaleAuth {
    constructor(contractAddresses) {
        this.contracts = contractAddresses;
        this.web3 = null;
        this.account = null;
        this.preSaleContract = null;
        this.nftContract = null;
        this.tokenContract = null;
        this.isGenesisHolder = false;
        this.userInfo = {};
        
        // Contract ABIs (simplified - include full ABIs in production)
        this.preSaleABI = [
            "function buyTokens(uint256 tokenAmount) payable",
            "function isGenesisHolder(address user) view returns (bool)",
            "function getPreSaleInfo() view returns (uint8, uint256, uint256, uint256, uint256, bool, uint256, uint256)",
            "function getCurrentPrice(address user) view returns (uint256)",
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
    
    // Connect wallet and authenticate user
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
            
            // Verify network (optional - add your preferred network)
            await this.verifyNetwork();
            
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
    
    // Verify network (Ethereum mainnet = 1, Polygon = 137, etc.)
    async verifyNetwork() {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const expectedChainId = this.contracts.chainId || '0x1'; // Default to Ethereum mainnet
        
        if (chainId !== expectedChainId) {
            throw new Error(`Please switch to the correct network. Expected: ${expectedChainId}, Current: ${chainId}`);
        }
    }
    
    // Authenticate Genesis NFT holder
    async authenticateGenesisHolder() {
        try {
            if (!this.account) throw new Error('No account connected');
            
            // Check NFT balance
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
    
    // Load user pre-sale information
    async loadUserInfo() {
        try {
            if (!this.account) throw new Error('No account connected');
            
            const preSaleInfo = await this.preSaleContract.methods
                .getPreSaleInfo()
                .call({ from: this.account });
            
            const currentPrice = await this.preSaleContract.methods
                .getCurrentPrice(this.account)
                .call();
            
            const remainingTokens = await this.preSaleContract.methods
                .getRemainingTokens()
                .call();
            
            this.userInfo = {
                phase: this.getPhaseString(preSaleInfo[0]),
                currentPrice: this.web3.utils.fromWei(currentPrice, 'ether'),
                remainingTokens: this.web3.utils.fromWei(remainingTokens, 'ether'),
                userPurchased: this.web3.utils.fromWei(preSaleInfo[3], 'ether'),
                userMaxPurchase: this.web3.utils.fromWei(preSaleInfo[4], 'ether'),
                isGenesis: preSaleInfo[5],
                phaseStartTime: new Date(parseInt(preSaleInfo[6]) * 1000),
                phaseEndTime: new Date(parseInt(preSaleInfo[7]) * 1000)
            };
            
            return this.userInfo;
            
        } catch (error) {
            console.error('Failed to load user info:', error);
            return {};
        }
    }
    
    // Purchase tokens in pre-sale
    async purchaseTokens(tokenAmount, ethAmount) {
        try {
            if (!this.account) throw new Error('No account connected');
            
            const tokenAmountWei = this.web3.utils.toWei(tokenAmount.toString(), 'ether');
            const ethAmountWei = this.web3.utils.toWei(ethAmount.toString(), 'ether');
            
            // Estimate gas
            const gasEstimate = await this.preSaleContract.methods
                .buyTokens(tokenAmountWei)
                .estimateGas({
                    from: this.account,
                    value: ethAmountWei
                });
            
            // Execute purchase
            const transaction = await this.preSaleContract.methods
                .buyTokens(tokenAmountWei)
                .send({
                    from: this.account,
                    value: ethAmountWei,
                    gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
                });
            
            // Refresh user info after purchase
            await this.loadUserInfo();
            
            return {
                success: true,
                transactionHash: transaction.transactionHash,
                tokenAmount: tokenAmount,
                ethAmount: ethAmount,
                gasUsed: transaction.gasUsed
            };
            
        } catch (error) {
            console.error('Token purchase failed:', error);
            throw error;
        }
    }
    
    // Calculate purchase cost
    calculatePurchaseCost(tokenAmount) {
        if (!this.userInfo.currentPrice) return '0';
        
        const cost = parseFloat(tokenAmount) * parseFloat(this.userInfo.currentPrice);
        return cost.toFixed(6);
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
    
    // Listen to account changes
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
            
            window.ethereum.on('chainChanged', () => {
                // Reload page on network change
                window.location.reload();
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
            isGenesisHolder: this.isGenesisHolder,
            currentPhase: this.userInfo.phase || 'Unknown',
            discountEligible: this.isGenesisHolder,
            discountAmount: this.isGenesisHolder ? '30%' : '0%',
            pricePerToken: this.userInfo.currentPrice || '0',
            tokensRemaining: this.userInfo.remainingTokens || '0',
            userPurchased: this.userInfo.userPurchased || '0',
            maxPurchaseRemaining: this.userInfo.userMaxPurchase ? 
                (parseFloat(this.userInfo.userMaxPurchase) - parseFloat(this.userInfo.userPurchased || 0)).toString() : '0'
        };
    }
}

// Usage example and initialization
const HAVANA_CONTRACTS = {
    preSaleAddress: 'YOUR_PRE_SALE_CONTRACT_ADDRESS',
    nftAddress: 'YOUR_GENESIS_NFT_CONTRACT_ADDRESS',
    tokenAddress: 'YOUR_HVNA_TOKEN_CONTRACT_ADDRESS',
    chainId: '0x1' // Ethereum mainnet
};

// Export for use in your frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HavanaPreSaleAuth, HAVANA_CONTRACTS };
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.HavanaPreSaleAuth = HavanaPreSaleAuth;
    window.HAVANA_CONTRACTS = HAVANA_CONTRACTS;
}