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
}

contract TokenPreSaleVesting {
    IERC20 public hvnaToken;
    IERC721 public genesisNFT;
    AggregatorV3Interface public priceFeed;
    address public owner;

    // Pre-sale phases
    enum Phase { GENESIS, PUBLIC, ENDED }
    Phase public currentPhase = Phase.GENESIS;

    // USD Pricing (in mills - 1/10th of a cent to avoid rounding issues)
    uint256 public tokenPriceUSDMills = 10; // $0.01 = 10 mills (1 mill = $0.001)
    uint256 public genesisDiscountPercent = 30; // 30% discount

    // Sale limits
    uint256 public tokensSold = 0;
    uint256 public maxTokensForPreSale = 15000000 * 10**18;
    uint256 public genesisPhaseLimit = 5000000 * 10**18;

    // Phase timing
    uint256 public genesisPhaseStart;
    uint256 public genesisPhaseEnd;
    uint256 public publicPhaseStart;
    uint256 public publicPhaseEnd;

    // Vesting - Gradual Release: 40% at launch, 40% after 3 months, 20% after 6 months
    uint256 public vestingStartDate; // When vesting begins (trading launch)
    bool public vestingEnabled = false;

    uint256 public constant FIRST_VESTING_PERCENT = 40;  // 40% at launch
    uint256 public constant SECOND_VESTING_PERCENT = 40; // 40% at 3 months
    uint256 public constant THIRD_VESTING_PERCENT = 20;  // 20% at 6 months
    uint256 public constant SECOND_VESTING_DELAY = 90 days;  // 3 months
    uint256 public constant THIRD_VESTING_DELAY = 180 days;  // 6 months

    // Purchase tracking - tokens are stored here until claim
    mapping(address => uint256) public purchasedAmount;
    mapping(address => uint256) public claimedAmount;
    mapping(address => bool) public hasClaimedGenesisBenefit;

    // Purchase limits (owner can update for flexibility)
    uint256 public minPurchase = 1000 * 10**18;  // $10 minimum
    uint256 public maxPurchaseGenesis = 1000000 * 10**18;  // $10,000 maximum for Genesis
    uint256 public maxPurchasePublic = 1000000 * 10**18;  // $10,000 maximum for Public

    bool public saleActive = false;

    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 costETH,
        uint256 costUSD,
        Phase phase,
        bool isGenesis
    );
    event TokensClaimed(address indexed buyer, uint256 amount);
    event PhaseChanged(Phase newPhase);
    event VestingEnabled(uint256 vestingStartDate);

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
        address _priceFeedAddress,
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
        // vestingStartDate will be set later when you call enableVesting()
    }

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

    function getETHUSDPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        return uint256(price);
    }

    function getTokenPriceInETH(bool isGenesis) public view returns (uint256) {
        uint256 ethUsdPrice = getETHUSDPrice();
        uint256 effectivePriceUSDMills = isGenesis ?
            (tokenPriceUSDMills * (100 - genesisDiscountPercent)) / 100 :
            tokenPriceUSDMills;

        // Convert mills to USD with 8 decimals: mills * 10^5 (since 1 mill = 0.001 USD = 10^5 in 8 decimals)
        uint256 priceUSDWith8Decimals = effectivePriceUSDMills * 10**5;
        return (priceUSDWith8Decimals * 10**18) / ethUsdPrice;
    }

    function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) public view returns (uint256 ethCost, uint256 usdCost) {
        uint256 tokenPriceETH = getTokenPriceInETH(isGenesis);
        ethCost = (tokenAmount * tokenPriceETH) / 10**18;

        uint256 effectivePriceUSDMills = isGenesis ?
            (tokenPriceUSDMills * (100 - genesisDiscountPercent)) / 100 :
            tokenPriceUSDMills;
        // Convert mills to USD: mills / 1000, then adjust for token decimals
        usdCost = (tokenAmount * effectivePriceUSDMills) / (10**18 * 1000);
    }

    function isGenesisHolder(address user) public view returns (bool) {
        return genesisNFT.balanceOf(user) > 0;
    }

    // VESTING: Purchase records allocation, doesn't transfer tokens yet
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

        (uint256 ethCost, uint256 usdCost) = calculatePurchaseCost(tokenAmount, isGenesis);
        require(msg.value >= ethCost, "Insufficient ETH sent");

        // VESTING: Record purchase, DON'T transfer tokens yet
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

    // VESTING: Calculate how many tokens can be claimed based on vesting schedule
    function getVestedAmount(address user) public view returns (uint256) {
        if (!vestingEnabled) return 0;

        uint256 totalPurchased = purchasedAmount[user];
        if (totalPurchased == 0) return 0;

        uint256 currentTime = block.timestamp;
        uint256 vestedPercent = 0;

        // First vesting: 40% at launch
        if (currentTime >= vestingStartDate) {
            vestedPercent = FIRST_VESTING_PERCENT;
        }

        // Second vesting: 40% at 3 months (total 80%)
        if (currentTime >= vestingStartDate + SECOND_VESTING_DELAY) {
            vestedPercent = FIRST_VESTING_PERCENT + SECOND_VESTING_PERCENT;
        }

        // Third vesting: 20% at 6 months (total 100%)
        if (currentTime >= vestingStartDate + THIRD_VESTING_DELAY) {
            vestedPercent = 100;
        }

        return (totalPurchased * vestedPercent) / 100;
    }

    // VESTING: Buyers claim their vested tokens
    function claimTokens() public {
        require(vestingEnabled, "Vesting not enabled yet");

        uint256 vestedAmount = getVestedAmount(msg.sender);
        uint256 alreadyClaimed = claimedAmount[msg.sender];
        uint256 claimable = vestedAmount - alreadyClaimed;

        require(claimable > 0, "No tokens to claim");

        claimedAmount[msg.sender] += claimable;
        require(hvnaToken.transfer(msg.sender, claimable), "Token transfer failed");

        emit TokensClaimed(msg.sender, claimable);
    }

    // View function: Get user's claimable tokens right now
    function getClaimableTokens(address user) public view returns (uint256) {
        uint256 vested = getVestedAmount(user);
        uint256 claimed = claimedAmount[user];
        return vested - claimed;
    }

    // View function: Get user's total purchased tokens
    function getPurchasedTokens(address user) public view returns (uint256) {
        return purchasedAmount[user];
    }

    // View function: Get user's unclaimed tokens (total purchased - claimed)
    function getUnclaimedTokens(address user) public view returns (uint256) {
        return purchasedAmount[user] - claimedAmount[user];
    }

    // Owner functions
    function updatePhase() public {
        uint256 currentTime = block.timestamp;

        if (currentTime >= publicPhaseStart && currentTime <= publicPhaseEnd && currentPhase != Phase.PUBLIC) {
            currentPhase = Phase.PUBLIC;
            emit PhaseChanged(Phase.PUBLIC);
        } else if (currentTime > publicPhaseEnd) {
            currentPhase = Phase.ENDED;
            emit PhaseChanged(Phase.ENDED);
        }
    }

    function toggleSale() public onlyOwner {
        saleActive = !saleActive;
    }

    function enableVesting() public onlyOwner {
        require(!vestingEnabled, "Vesting already enabled");
        vestingEnabled = true;
        vestingStartDate = block.timestamp;
        emit VestingEnabled(vestingStartDate);
    }

    function setVestingStartDate(uint256 _vestingStartDate) public onlyOwner {
        require(!vestingEnabled, "Cannot change after vesting enabled");
        vestingStartDate = _vestingStartDate;
    }

    function setPricing(uint256 _tokenPriceUSDMills, uint256 _genesisDiscountPercent) public onlyOwner {
        require(_genesisDiscountPercent <= 100, "Invalid discount");
        tokenPriceUSDMills = _tokenPriceUSDMills;
        genesisDiscountPercent = _genesisDiscountPercent;
    }

    // New function: Update purchase limits for flexibility
    function setPurchaseLimits(
        uint256 _minPurchase,
        uint256 _maxPurchaseGenesis,
        uint256 _maxPurchasePublic
    ) public onlyOwner {
        require(_minPurchase > 0, "Min purchase must be > 0");
        require(_maxPurchaseGenesis >= _minPurchase, "Max Genesis must be >= min");
        require(_maxPurchasePublic >= _minPurchase, "Max Public must be >= min");

        minPurchase = _minPurchase;
        maxPurchaseGenesis = _maxPurchaseGenesis;
        maxPurchasePublic = _maxPurchasePublic;
    }

    // Owner function: Update phase timings
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

    // Owner function: Force change to specific phase
    function forcePhaseChange(Phase newPhase) public onlyOwner {
        currentPhase = newPhase;
        emit PhaseChanged(newPhase);
    }

    // Admin function to migrate purchases from old presale
    function migratePurchase(address buyer, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        purchasedAmount[buyer] += amount;
        tokensSold += amount;
    }

    function withdrawETH() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawUnsoldTokens() public onlyOwner {
        require(currentPhase == Phase.ENDED || !saleActive, "Pre-sale still active");
        uint256 unsold = hvnaToken.balanceOf(address(this)) - (tokensSold - getClaimedTotal());
        require(hvnaToken.transfer(owner, unsold), "Token transfer failed");
    }

    function getClaimedTotal() internal view returns (uint256) {
        // This is simplified - in production you'd track this with a state variable
        return 0;
    }
}
