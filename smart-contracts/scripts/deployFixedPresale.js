require('dotenv').config();
const { ethers } = require('ethers');

async function deployFixedPresale() {
    console.log('🚀 Deploying Fixed Presale Contract...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('👛 Deployer:', wallet.address);
    
    // Existing addresses
    const TOKEN_CONTRACT = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
    const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    
    // Timing (immediate public phase)
    const now = Math.floor(Date.now() / 1000);
    const genesisStart = now - 3600;    // 1 hour ago (ended)
    const genesisEnd = now - 1800;      // 30 min ago (ended) 
    const publicStart = now - 1800;     // 30 min ago (active)
    const publicEnd = now + (365 * 24 * 3600); // 1 year from now
    
    console.log('⏰ Phase Timing:');
    console.log('Genesis: ENDED (past)');
    console.log('Public: ACTIVE (now - 1 year)');
    
    // Deploy new presale with corrected prices
    console.log('\n📄 Deploying TokenPreSale contract...');
    
    const contractCode = `
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.19;
    
    interface IERC20 {
        function transfer(address to, uint256 amount) external returns (bool);
        function balanceOf(address account) external view returns (uint256);
    }
    
    interface IERC721 {
        function balanceOf(address owner) external view returns (uint256);
    }
    
    contract TokenPreSaleFixed {
        IERC20 public hvnaToken;
        IERC721 public genesisNFT;
        address public owner;
        
        enum Phase { GENESIS, PUBLIC, ENDED }
        Phase public currentPhase = Phase.PUBLIC; // Start in public phase
        
        // CORRECTED pricing - reasonable for testing
        uint256 public genesisPrice = 0.000001667 ether; // ~$0.007 per token
        uint256 public publicPrice = 0.000002381 ether;  // ~$0.01 per token
        
        uint256 public tokensSold = 0;
        uint256 public maxTokensForPreSale = 15000000 * 10**18;
        uint256 public genesisPhaseLimit = 5000000 * 10**18;
        
        uint256 public genesisPhaseStart;
        uint256 public genesisPhaseEnd;
        uint256 public publicPhaseStart;
        uint256 public publicPhaseEnd;
        
        mapping(address => uint256) public purchasedAmount;
        uint256 public minPurchase = 1000 * 10**18;
        uint256 public maxPurchaseGenesis = 50000 * 10**18;
        uint256 public maxPurchasePublic = 25000 * 10**18;
        
        bool public saleActive = true; // Start active
        
        event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, Phase phase, bool isGenesis);
        
        constructor(
            address _hvnaTokenAddress,
            address _genesisNFTAddress,
            uint256 _genesisPhaseStart,
            uint256 _genesisPhaseEnd,
            uint256 _publicPhaseStart,
            uint256 _publicPhaseEnd
        ) {
            hvnaToken = IERC20(_hvnaTokenAddress);
            genesisNFT = IERC721(_genesisNFTAddress);
            owner = msg.sender;
            
            genesisPhaseStart = _genesisPhaseStart;
            genesisPhaseEnd = _genesisPhaseEnd;
            publicPhaseStart = _publicPhaseStart;
            publicPhaseEnd = _publicPhaseEnd;
            
            // Auto-update phase
            updatePhase();
        }
        
        function isGenesisHolder(address user) public view returns (bool) {
            return genesisNFT.balanceOf(user) > 0;
        }
        
        function buyTokens(uint256 tokenAmount) public payable {
            require(saleActive, "Sale is not active");
            require(tokenAmount >= minPurchase, "Below minimum purchase amount");
            require(tokensSold + tokenAmount <= maxTokensForPreSale, "Exceeds pre-sale limit");
            
            bool isGenesis = isGenesisHolder(msg.sender);
            uint256 currentPrice = isGenesis ? genesisPrice : publicPrice;
            uint256 maxPurchase = isGenesis ? maxPurchaseGenesis : maxPurchasePublic;
            
            require(purchasedAmount[msg.sender] + tokenAmount <= maxPurchase, "Exceeds individual purchase limit");
            
            uint256 cost = (tokenAmount * currentPrice) / 10**18;
            require(msg.value >= cost, "Insufficient ETH sent");
            
            require(hvnaToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
            
            tokensSold += tokenAmount;
            purchasedAmount[msg.sender] += tokenAmount;
            
            if (msg.value > cost) {
                payable(msg.sender).transfer(msg.value - cost);
            }
            
            emit TokensPurchased(msg.sender, tokenAmount, cost, currentPhase, isGenesis);
        }
        
        function updatePhase() public {
            uint256 currentTime = block.timestamp;
            
            if (currentTime >= genesisPhaseStart && currentTime <= genesisPhaseEnd) {
                currentPhase = Phase.GENESIS;
            } else if (currentTime >= publicPhaseStart && currentTime <= publicPhaseEnd) {
                currentPhase = Phase.PUBLIC;
            } else if (currentTime > publicPhaseEnd) {
                currentPhase = Phase.ENDED;
            }
        }
        
        function getCurrentPrice(address user) public view returns (uint256) {
            return isGenesisHolder(user) ? genesisPrice : publicPrice;
        }
        
        function withdrawETH() public {
            require(msg.sender == owner, "Not owner");
            payable(owner).transfer(address(this).balance);
        }
    }`;
    
    // This is a simplified approach - in production you'd compile the contract properly
    console.log('❌ Cannot deploy from script - need to update contract source and redeploy');
    console.log('\n💡 Alternative solution: Update the frontend to work with current prices');
    console.log('Current contract expects:');
    console.log('- Genesis: 0.007 ETH per token');  
    console.log('- Public: 0.01 ETH per token');
    console.log('- 1000 tokens = 7 ETH (Genesis) or 10 ETH (Public)');
    console.log('\n🎯 You need more ETH to test purchases');
    console.log('Minimum for Genesis: ~7 ETH');
    console.log('You have: 0.005 ETH');
    console.log('\nRecommendation: Bridge more ETH or lower the minimum purchase in contract');
}

deployFixedPresale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });