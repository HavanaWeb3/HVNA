// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// Chainlink Price Feed Interface for ETH/USD conversion
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract TokenPreSaleBase {
    IERC20 public hvnaToken;
    IERC721 public genesisNFT; // BoldlyElephunkyNFT contract on Base
    AggregatorV3Interface public priceFeed; // ETH/USD price feed on Base
    address public owner;
    
    // Pre-sale phases
    enum Phase { GENESIS, PUBLIC, ENDED }
    Phase public currentPhase = Phase.GENESIS;
    
    // USD Pricing (fixed prices in USD cents to avoid decimals)
    uint256 public tokenPriceUSDCents = 100; // $0.01 = 100 cents
    uint256 public genesisDiscountPercent = 30; // 30% discount
    
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
    
    event TokensPurchased(
        address indexed buyer, 
        uint256 amount, 
        uint256 costETH, 
        uint256 costUSD, 
        Phase phase, 
        bool isGenesis
    );
    event PhaseChanged(Phase newPhase);
    event PriceUpdated(uint256 newPriceUSDCents, uint256 newDiscountPercent);
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
        address _priceFeedAddress, // Chainlink ETH/USD on Base: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70
        uint256 _genesisPhaseStart,
        uint256 _genesisPhaseEnd,
        uint256 _publicPhaseStart,
        uint256 _publicPhaseEnd
    ) {
        hvnaToken = IERC20(_hvnaTokenAddress);
        genesisNFT = IERC721(_genesisNFTAddress);
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
        owner = msg.sender;
        
        genesisPhaseStart = _genesisPhaseStart;
        genesisPhaseEnd = _genesisPhaseEnd;
        publicPhaseStart = _publicPhaseStart;
        publicPhaseEnd = _publicPhaseEnd;
    }
    
    // Get current ETH/USD price from Chainlink
    function getETHUSDPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price); // Returns price with 8 decimals (e.g., 350000000000 for $3500)
    }
    
    // Calculate token price in ETH based on USD price
    function getTokenPriceInETH(bool isGenesis) public view returns (uint256) {
        uint256 ethUsdPrice = getETHUSDPrice(); // 8 decimals
        uint256 effectivePriceUSDCents = isGenesis ? 
            (tokenPriceUSDCents * (100 - genesisDiscountPercent)) / 100 : 
            tokenPriceUSDCents;
        
        // Convert cents to dollars with 8 decimals: cents * 10^8 / 100
        uint256 priceUSDWith8Decimals = effectivePriceUSDCents * 10**6; // 100 cents * 10^6 = 10^8 for $1
        
        // Price in ETH = (USD Price * 10^18) / ETH_USD_Price
        return (priceUSDWith8Decimals * 10**18) / ethUsdPrice;
    }
    
    // Calculate total cost for token amount
    function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) public view returns (uint256 ethCost, uint256 usdCost) {
        uint256 tokenPriceETH = getTokenPriceInETH(isGenesis);
        ethCost = (tokenAmount * tokenPriceETH) / 10**18;
        
        uint256 effectivePriceUSDCents = isGenesis ? 
            (tokenPriceUSDCents * (100 - genesisDiscountPercent)) / 100 : 
            tokenPriceUSDCents;
        usdCost = (tokenAmount * effectivePriceUSDCents) / (10**18 * 100); // Convert to dollars
    }
    
    // Authentication: Verify Genesis NFT holder
    function isGenesisHolder(address user) public view returns (bool) {
        return genesisNFT.balanceOf(user) > 0;
    }
    
    function getGenesisNFTBalance(address user) public view returns (uint256) {
        return genesisNFT.balanceOf(user);
    }
    
    // Main purchase function with dynamic ETH pricing
    function buyTokens(uint256 tokenAmount) public payable saleIsActive validPhase {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount >= minPurchase, "Below minimum purchase amount");
        require(tokensSold + tokenAmount <= maxTokensForPreSale, "Exceeds pre-sale limit");
        
        bool isGenesis = isGenesisHolder(msg.sender);
        uint256 maxPurchase;
        
        // Determine limits based on phase and Genesis status
        if (currentPhase == Phase.GENESIS) {
            require(isGenesis, "Genesis phase: Only NFT holders can participate");
            require(tokensSold + tokenAmount <= genesisPhaseLimit, "Exceeds Genesis phase limit");
            maxPurchase = maxPurchaseGenesis;
            
            // Emit verification event
            emit GenesisHolderVerified(msg.sender, getGenesisNFTBalance(msg.sender));
        } else if (currentPhase == Phase.PUBLIC) {
            maxPurchase = isGenesis ? maxPurchaseGenesis : maxPurchasePublic;
        } else {
            revert("Invalid phase");
        }
        
        require(purchasedAmount[msg.sender] + tokenAmount <= maxPurchase, "Exceeds individual purchase limit");
        
        // Calculate cost in ETH using current price feed
        (uint256 ethCost, uint256 usdCost) = calculatePurchaseCost(tokenAmount, isGenesis);
        require(msg.value >= ethCost, "Insufficient ETH sent");
        
        // Transfer tokens
        require(hvnaToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        // Update tracking
        tokensSold += tokenAmount;
        purchasedAmount[msg.sender] += tokenAmount;
        
        if (isGenesis && !hasClaimedGenesisBenefit[msg.sender]) {
            hasClaimedGenesisBenefit[msg.sender] = true;
        }
        
        // Refund excess ETH
        if (msg.value > ethCost) {
            payable(msg.sender).transfer(msg.value - ethCost);
        }
        
        emit TokensPurchased(msg.sender, tokenAmount, ethCost, usdCost, currentPhase, isGenesis);
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
    
    function getCurrentPrices(address user) public view returns (uint256 ethPrice, uint256 usdCents) {
        bool isGenesis = isGenesisHolder(user);
        ethPrice = getTokenPriceInETH(isGenesis);
        usdCents = isGenesis ? 
            (tokenPriceUSDCents * (100 - genesisDiscountPercent)) / 100 : 
            tokenPriceUSDCents;
    }
    
    function getRemainingTokens() public view returns (uint256) {
        return maxTokensForPreSale - tokensSold;
    }
    
    function getRemainingGenesisTokens() public view returns (uint256) {
        if (tokensSold >= genesisPhaseLimit) return 0;
        return genesisPhaseLimit - tokensSold;
    }
    
    // Admin functions
    function setPricing(uint256 _tokenPriceUSDCents, uint256 _genesisDiscountPercent) public onlyOwner {
        require(_genesisDiscountPercent <= 100, "Discount cannot exceed 100%");
        tokenPriceUSDCents = _tokenPriceUSDCents;
        genesisDiscountPercent = _genesisDiscountPercent;
        emit PriceUpdated(_tokenPriceUSDCents, _genesisDiscountPercent);
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
    
    function updatePriceFeed(address _newPriceFeed) public onlyOwner {
        priceFeed = AggregatorV3Interface(_newPriceFeed);
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
        uint256 currentETHPriceForUser,
        uint256 currentUSDCentsForUser,
        uint256 remainingTokens,
        uint256 userPurchased,
        uint256 userMaxPurchase,
        bool userIsGenesis,
        uint256 phaseStartTime,
        uint256 phaseEndTime,
        uint256 currentETHUSDRate
    ) {
        bool isGenesis = isGenesisHolder(msg.sender);
        (uint256 ethPrice, uint256 usdCents) = getCurrentPrices(msg.sender);
        
        return (
            currentPhase,
            ethPrice,
            usdCents,
            getRemainingTokens(),
            purchasedAmount[msg.sender],
            isGenesis ? maxPurchaseGenesis : maxPurchasePublic,
            isGenesis,
            getPhaseStartTime(),
            getPhaseEndTime(),
            getETHUSDPrice()
        );
    }
}