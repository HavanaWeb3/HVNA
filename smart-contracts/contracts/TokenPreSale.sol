// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract TokenPreSale {
    IERC20 public hvnaToken;
    IERC721 public genesisNFT; // BoldlyElephunkyNFT contract
    address public owner;
    
    // Pre-sale phases
    enum Phase { GENESIS, PUBLIC, ENDED }
    Phase public currentPhase = Phase.GENESIS;
    
    // Pricing structure
    uint256 public genesisPrice = 0.007 ether; // 30% discount from 0.01 ETH
    uint256 public publicPrice = 0.01 ether;
    
    // Sale limits
    uint256 public tokensSold = 0;
    uint256 public maxTokensForPreSale = 15000000 * 10**18; // 15% of total supply for pre-sale
    uint256 public genesisPhaseLimit = 5000000 * 10**18; // 5M tokens reserved for Genesis holders
    
    // Phase timing
    uint256 public genesisPhaseStart;
    uint256 public genesisPhaseEnd;
    uint256 public publicPhaseStart;
    uint256 public publicPhaseEnd;
    
    // Purchase tracking
    mapping(address => uint256) public purchasedAmount;
    mapping(address => bool) public hasClaimedGenesisBenefit;
    
    // Purchase limits
    uint256 public minPurchase = 1000 * 10**18; // 1,000 tokens minimum
    uint256 public maxPurchaseGenesis = 50000 * 10**18; // 50,000 tokens max for Genesis holders
    uint256 public maxPurchasePublic = 25000 * 10**18; // 25,000 tokens max for public
    
    bool public saleActive = false;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, Phase phase, bool isGenesis);
    event PhaseChanged(Phase newPhase);
    event PriceUpdated(uint256 genesisPrice, uint256 publicPrice);
    event SaleStatusChanged(bool active);
    event GenesisHolderVerified(address indexed holder, uint256 nftBalance);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier saleIsActive() {
        require(saleActive, "Sale is not active");
        _;
    }
    
    modifier validPhase() {
        require(currentPhase != Phase.ENDED, "Pre-sale has ended");
        require(block.timestamp >= getPhaseStartTime(), "Phase not started yet");
        require(block.timestamp <= getPhaseEndTime(), "Phase has ended");
        _;
    }
    
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
    }
    
    // Authentication: Verify Genesis NFT holder
    function isGenesisHolder(address user) public view returns (bool) {
        return genesisNFT.balanceOf(user) > 0;
    }
    
    function getGenesisNFTBalance(address user) public view returns (uint256) {
        return genesisNFT.balanceOf(user);
    }
    
    // Main purchase function with authentication
    function buyTokens(uint256 tokenAmount) public payable saleIsActive validPhase {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount >= minPurchase, "Below minimum purchase amount");
        require(tokensSold + tokenAmount <= maxTokensForPreSale, "Exceeds pre-sale limit");
        
        bool isGenesis = isGenesisHolder(msg.sender);
        uint256 currentPrice;
        uint256 maxPurchase;
        
        // Determine pricing and limits based on phase and Genesis status
        if (currentPhase == Phase.GENESIS) {
            require(isGenesis, "Genesis phase: Only NFT holders can participate");
            require(tokensSold + tokenAmount <= genesisPhaseLimit, "Exceeds Genesis phase limit");
            currentPrice = genesisPrice;
            maxPurchase = maxPurchaseGenesis;
            
            // Emit verification event
            emit GenesisHolderVerified(msg.sender, getGenesisNFTBalance(msg.sender));
        } else if (currentPhase == Phase.PUBLIC) {
            // Public phase: Genesis holders still get discount
            currentPrice = isGenesis ? genesisPrice : publicPrice;
            maxPurchase = isGenesis ? maxPurchaseGenesis : maxPurchasePublic;
        } else {
            revert("Invalid phase");
        }
        
        require(purchasedAmount[msg.sender] + tokenAmount <= maxPurchase, "Exceeds individual purchase limit");
        
        uint256 cost = (tokenAmount * currentPrice) / 10**18;
        require(msg.value >= cost, "Insufficient ETH sent");
        
        // Transfer tokens
        require(hvnaToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        // Update tracking
        tokensSold += tokenAmount;
        purchasedAmount[msg.sender] += tokenAmount;
        
        if (isGenesis && !hasClaimedGenesisBenefit[msg.sender]) {
            hasClaimedGenesisBenefit[msg.sender] = true;
        }
        
        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit TokensPurchased(msg.sender, tokenAmount, cost, currentPhase, isGenesis);
    }
    
    // Phase management
    function updatePhase() public {
        uint256 currentTime = block.timestamp;
        
        if (currentTime >= genesisPhaseStart && currentTime <= genesisPhaseEnd && currentPhase != Phase.GENESIS) {
            currentPhase = Phase.GENESIS;
            emit PhaseChanged(Phase.GENESIS);
        } else if (currentTime >= publicPhaseStart && currentTime <= publicPhaseEnd && currentPhase != Phase.PUBLIC) {
            currentPhase = Phase.PUBLIC;
            emit PhaseChanged(Phase.PUBLIC);
        } else if (currentTime > publicPhaseEnd && currentPhase != Phase.ENDED) {
            currentPhase = Phase.ENDED;
            emit PhaseChanged(Phase.ENDED);
        }
    }
    
    function forcePhaseChange(Phase newPhase) public onlyOwner {
        currentPhase = newPhase;
        emit PhaseChanged(newPhase);
    }
    
    // Utility functions
    function getPhaseStartTime() public view returns (uint256) {
        if (currentPhase == Phase.GENESIS) return genesisPhaseStart;
        if (currentPhase == Phase.PUBLIC) return publicPhaseStart;
        return 0;
    }
    
    function getPhaseEndTime() public view returns (uint256) {
        if (currentPhase == Phase.GENESIS) return genesisPhaseEnd;
        if (currentPhase == Phase.PUBLIC) return publicPhaseEnd;
        return 0;
    }
    
    function getCurrentPrice(address user) public view returns (uint256) {
        if (currentPhase == Phase.GENESIS) return genesisPrice;
        if (currentPhase == Phase.PUBLIC) {
            return isGenesisHolder(user) ? genesisPrice : publicPrice;
        }
        return publicPrice;
    }
    
    function getRemainingTokens() public view returns (uint256) {
        return maxTokensForPreSale - tokensSold;
    }
    
    function getRemainingGenesisTokens() public view returns (uint256) {
        if (tokensSold >= genesisPhaseLimit) return 0;
        return genesisPhaseLimit - tokensSold;
    }
    
    // Admin functions
    function setPricing(uint256 _genesisPrice, uint256 _publicPrice) public onlyOwner {
        genesisPrice = _genesisPrice;
        publicPrice = _publicPrice;
        emit PriceUpdated(_genesisPrice, _publicPrice);
    }
    
    function setPhaseTiming(
        uint256 _genesisStart,
        uint256 _genesisEnd,
        uint256 _publicStart,
        uint256 _publicEnd
    ) public onlyOwner {
        genesisPhaseStart = _genesisStart;
        genesisPhaseEnd = _genesisEnd;
        publicPhaseStart = _publicStart;
        publicPhaseEnd = _publicEnd;
    }
    
    function setPurchaseLimits(
        uint256 _minPurchase,
        uint256 _maxPurchaseGenesis,
        uint256 _maxPurchasePublic
    ) public onlyOwner {
        minPurchase = _minPurchase;
        maxPurchaseGenesis = _maxPurchaseGenesis;
        maxPurchasePublic = _maxPurchasePublic;
    }
    
    function toggleSale() public onlyOwner {
        saleActive = !saleActive;
        emit SaleStatusChanged(saleActive);
    }
    
    function withdrawETH() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function withdrawUnsoldTokens() public onlyOwner {
        require(currentPhase == Phase.ENDED || !saleActive, "Pre-sale still active");
        uint256 remainingTokens = hvnaToken.balanceOf(address(this));
        require(hvnaToken.transfer(owner, remainingTokens), "Token transfer failed");
    }
    
    function emergencyWithdraw() public onlyOwner {
        uint256 remainingTokens = hvnaToken.balanceOf(address(this));
        if (remainingTokens > 0) {
            hvnaToken.transfer(owner, remainingTokens);
        }
        if (address(this).balance > 0) {
            payable(owner).transfer(address(this).balance);
        }
    }
    
    // View functions for frontend integration
    function getPreSaleInfo() public view returns (
        Phase phase,
        uint256 currentPriceForUser,
        uint256 remainingTokens,
        uint256 userPurchased,
        uint256 userMaxPurchase,
        bool userIsGenesis,
        uint256 phaseStartTime,
        uint256 phaseEndTime
    ) {
        return (
            currentPhase,
            getCurrentPrice(msg.sender),
            getRemainingTokens(),
            purchasedAmount[msg.sender],
            isGenesisHolder(msg.sender) ? maxPurchaseGenesis : maxPurchasePublic,
            isGenesisHolder(msg.sender),
            getPhaseStartTime(),
            getPhaseEndTime()
        );
    }
}