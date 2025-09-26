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
    Phase public currentPhase = Phase.PUBLIC;
    
    // USD-based pricing (in cents per 1000 tokens)
    uint256 public genesisPriceUSDCents = 700;  // $7.00 per 1000 tokens
    uint256 public publicPriceUSDCents = 1000;  // $10.00 per 1000 tokens
    
    // ETH price in USD (updatable by owner)
    uint256 public ethPriceUSD = 4000; // $4000 per ETH (can be updated)
    
    uint256 public tokensSold = 0;
    uint256 public maxTokensForPreSale = 25000000 * 10**18;
    uint256 public genesisPhaseLimit = 5000000 * 10**18;
    
    uint256 public genesisPhaseStart;
    uint256 public genesisPhaseEnd;
    uint256 public publicPhaseStart;
    uint256 public publicPhaseEnd;
    
    mapping(address => uint256) public purchasedAmount;
    mapping(address => bool) public hasClaimedGenesisBenefit;
    
    uint256 public minPurchase = 1000 * 10**18; // 1,000 tokens minimum
    uint256 public maxPurchaseGenesis = 50000 * 10**18;
    uint256 public maxPurchasePublic = 25000 * 10**18;
    
    bool public saleActive = true;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, Phase phase, bool isGenesis);
    event PhaseChanged(Phase newPhase);
    event ETHPriceUpdated(uint256 newPriceUSD);
    event TokenPricesUpdated(uint256 genesisCents, uint256 publicCents);
    
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
        
        updatePhase();
    }
    
    function isGenesisHolder(address user) public view returns (bool) {
        return genesisNFT.balanceOf(user) > 0;
    }
    
    function getGenesisNFTBalance(address user) public view returns (uint256) {
        return genesisNFT.balanceOf(user);
    }
    
    // Calculate cost in ETH based on current ETH price
    function calculateCostETH(uint256 tokenAmount, address user) public view returns (uint256) {
        bool isGenesis = isGenesisHolder(user);
        uint256 priceCentsPer1000Tokens = isGenesis ? genesisPriceUSDCents : publicPriceUSDCents;
        
        // Calculate total cost in cents
        // tokenAmount is in wei (18 decimals), price is cents per 1000 tokens
        // We want: (tokenAmount / 10**18) * (priceCentsPer1000Tokens / 1000) = total cents
        // Simplifying: (tokenAmount * priceCentsPer1000Tokens) / (10**18 * 1000)
        uint256 totalCostCents = (tokenAmount * priceCentsPer1000Tokens) / (10**18 * 1000);
        
        // Convert cents to USD, then to ETH
        // totalCostCents / 100 = USD, then USD / ethPriceUSD = ETH
        // To maintain precision: (totalCostCents * 10**18) / (100 * ethPriceUSD)
        uint256 costETHWei = (totalCostCents * 10**18) / (100 * ethPriceUSD);
        
        return costETHWei;
    }
    
    function buyTokens(uint256 tokenAmount) public payable saleIsActive validPhase {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount >= minPurchase, "Below minimum purchase amount");
        require(tokensSold + tokenAmount <= maxTokensForPreSale, "Exceeds pre-sale limit");
        
        bool isGenesis = isGenesisHolder(msg.sender);
        uint256 maxPurchase;
        
        if (currentPhase == Phase.GENESIS) {
            require(isGenesis, "Genesis phase: Only NFT holders can participate");
            require(tokensSold + tokenAmount <= genesisPhaseLimit, "Exceeds Genesis phase limit");
            maxPurchase = maxPurchaseGenesis;
        } else if (currentPhase == Phase.PUBLIC) {
            maxPurchase = isGenesis ? maxPurchaseGenesis : maxPurchasePublic;
        } else {
            revert("Invalid phase");
        }
        
        require(purchasedAmount[msg.sender] + tokenAmount <= maxPurchase, "Exceeds individual purchase limit");
        
        uint256 cost = calculateCostETH(tokenAmount, msg.sender);
        require(msg.value >= cost, "Insufficient ETH sent");
        
        require(hvnaToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
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
    
    // Owner functions for price management
    function updateETHPrice(uint256 _ethPriceUSD) public onlyOwner {
        require(_ethPriceUSD > 0, "ETH price must be greater than 0");
        ethPriceUSD = _ethPriceUSD;
        emit ETHPriceUpdated(_ethPriceUSD);
    }
    
    function updateTokenPrices(uint256 _genesisPriceCents, uint256 _publicPriceCents) public onlyOwner {
        require(_genesisPriceCents > 0 && _publicPriceCents > 0, "Prices must be greater than 0");
        require(_genesisPriceCents <= _publicPriceCents, "Genesis price cannot exceed public price");
        genesisPriceUSDCents = _genesisPriceCents;
        publicPriceUSDCents = _publicPriceCents;
        emit TokenPricesUpdated(_genesisPriceCents, _publicPriceCents);
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
        return calculateCostETH(10**18, user); // Price for 1 token
    }
    
    function getRemainingTokens() public view returns (uint256) {
        return maxTokensForPreSale - tokensSold;
    }
    
    function getRemainingGenesisTokens() public view returns (uint256) {
        if (tokensSold >= genesisPhaseLimit) return 0;
        return genesisPhaseLimit - tokensSold;
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
    
    // View functions for frontend
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