// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// Chainlink Price Feed Interface for ETH/USD and BNB/USD conversion
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
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

/**
 * @title TokenPreSaleMultiChain
 * @notice Multi-chain presale contract supporting ETH, BNB, and USDT payments
 * @dev Accepts native currencies (ETH/BNB) and USDT stablecoin across multiple chains
 *
 * Key Features:
 * - Multi-token payment support (ETH, BNB, USDT)
 * - Vesting schedule: 40% at launch, 40% at +3 months, 20% at +6 months
 * - Genesis NFT holder discount: 30% off
 * - Chainlink price feeds for accurate conversion
 * - Purchase limits: $10 minimum, $10,000 maximum
 * - Cross-chain compatible (deploy on Ethereum, BSC, Base)
 */
contract TokenPreSaleMultiChain {
    IERC20 public hvnaToken;
    IERC721 public genesisNFT;
    IERC20 public usdtToken;
    AggregatorV3Interface public nativePriceFeed; // ETH/USD or BNB/USD depending on chain

    address public owner;
    string public chainName; // "Ethereum", "BSC", or "Base"

    // Pre-sale phases
    enum Phase { GENESIS, PUBLIC, ENDED }
    Phase public currentPhase = Phase.GENESIS;

    // USD Pricing (in cents)
    uint256 public tokenPriceUSDCents = 1; // $0.01 = 1 cent
    uint256 public genesisDiscountPercent = 30; // 30% discount

    // Sale limits
    uint256 public tokensSold = 0;
    uint256 public maxTokensForPreSale = 15000000 * 10**18; // 15M tokens per chain
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

    // Payment tracking by token type
    mapping(address => mapping(string => uint256)) public paymentsByToken; // user => tokenType => amount

    // Purchase limits
    uint256 public minPurchase = 1000 * 10**18;  // $10 minimum
    uint256 public maxPurchaseGenesis = 1000000 * 10**18;  // $10,000 maximum for Genesis
    uint256 public maxPurchasePublic = 1000000 * 10**18;  // $10,000 maximum for Public

    bool public saleActive = false;
    bool public usdtPaymentsEnabled = false;

    // Price feed staleness check (1 hour)
    uint256 public constant PRICE_FEED_MAX_DELAY = 3600;

    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 costInPaymentToken,
        uint256 costUSD,
        Phase phase,
        bool isGenesis,
        string paymentToken
    );
    event TokensClaimed(address indexed buyer, uint256 amount);
    event PhaseChanged(Phase newPhase);
    event VestingEnabled(uint256 vestingStartDate);
    event USDTPaymentToggled(bool enabled);

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

    /**
     * @notice Constructor to initialize the multi-chain presale contract
     * @param _hvnaTokenAddress Address of HVNA token (may be zero address if on different chain)
     * @param _genesisNFTAddress Address of Genesis NFT contract
     * @param _nativePriceFeedAddress Chainlink price feed (ETH/USD or BNB/USD)
     * @param _usdtTokenAddress Address of USDT token on this chain
     * @param _chainName Name of the blockchain (for event logging)
     * @param _genesisPhaseStart Timestamp for Genesis phase start
     * @param _genesisPhaseEnd Timestamp for Genesis phase end
     * @param _publicPhaseStart Timestamp for Public phase start
     * @param _publicPhaseEnd Timestamp for Public phase end
     */
    constructor(
        address _hvnaTokenAddress,
        address _genesisNFTAddress,
        address _nativePriceFeedAddress,
        address _usdtTokenAddress,
        string memory _chainName,
        uint256 _genesisPhaseStart,
        uint256 _genesisPhaseEnd,
        uint256 _publicPhaseStart,
        uint256 _publicPhaseEnd
    ) {
        hvnaToken = IERC20(_hvnaTokenAddress);
        genesisNFT = IERC721(_genesisNFTAddress);
        nativePriceFeed = AggregatorV3Interface(_nativePriceFeedAddress);
        usdtToken = IERC20(_usdtTokenAddress);
        owner = msg.sender;
        chainName = _chainName;

        genesisPhaseStart = _genesisPhaseStart;
        genesisPhaseEnd = _genesisPhaseEnd;
        publicPhaseStart = _publicPhaseStart;
        publicPhaseEnd = _publicPhaseEnd;
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

    /**
     * @notice Get the latest native currency price (ETH or BNB) in USD
     * @return price The price with 8 decimals (Chainlink standard)
     */
    function getNativeUSDPrice() public view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = nativePriceFeed.latestRoundData();

        require(price > 0, "Invalid price feed");
        require(answeredInRound >= roundId, "Stale price feed");
        require(block.timestamp - updatedAt < PRICE_FEED_MAX_DELAY, "Price feed too old");

        return uint256(price);
    }

    /**
     * @notice Calculate token price in native currency (ETH or BNB)
     * @param isGenesis Whether the buyer is a Genesis NFT holder
     * @return priceInNative Price per token in wei (18 decimals)
     */
    function getTokenPriceInNative(bool isGenesis) public view returns (uint256) {
        uint256 nativeUsdPrice = getNativeUSDPrice();
        uint256 effectivePriceUSDCents = isGenesis ?
            (tokenPriceUSDCents * (100 - genesisDiscountPercent)) / 100 :
            tokenPriceUSDCents;

        // Convert cents to USD with 8 decimals (Chainlink format)
        uint256 priceUSDWith8Decimals = effectivePriceUSDCents * 10**6; // 1 cent = 1,000,000 (8 decimals)

        // Calculate native token amount needed
        // (priceUSD / nativeUSD) * 10^18 to get wei
        return (priceUSDWith8Decimals * 10**18) / nativeUsdPrice;
    }

    /**
     * @notice Calculate token price in USDT (6 decimals)
     * @param isGenesis Whether the buyer is a Genesis NFT holder
     * @return priceInUSDT Price per token in USDT (6 decimals)
     */
    function getTokenPriceInUSDT(bool isGenesis) public view returns (uint256) {
        uint256 effectivePriceUSDCents = isGenesis ?
            (tokenPriceUSDCents * (100 - genesisDiscountPercent)) / 100 :
            tokenPriceUSDCents;

        // Convert cents to USDT (6 decimals)
        // 1 cent = 0.01 USDT = 10,000 (in 6 decimals)
        return effectivePriceUSDCents * 10**4;
    }

    /**
     * @notice Calculate purchase cost in native currency or USDT
     * @param tokenAmount Amount of tokens to purchase
     * @param isGenesis Whether the buyer is a Genesis NFT holder
     * @param useUSDT Whether to calculate in USDT or native currency
     * @return cost Cost in payment token (wei for native, 6 decimals for USDT)
     * @return usdCost Cost in USD (for event logging)
     */
    function calculatePurchaseCost(
        uint256 tokenAmount,
        bool isGenesis,
        bool useUSDT
    ) public view returns (uint256 cost, uint256 usdCost) {
        if (useUSDT) {
            uint256 tokenPriceUSDT = getTokenPriceInUSDT(isGenesis);
            cost = (tokenAmount * tokenPriceUSDT) / 10**18; // Convert from 18 decimals to 6
        } else {
            uint256 tokenPriceNative = getTokenPriceInNative(isGenesis);
            cost = (tokenAmount * tokenPriceNative) / 10**18;
        }

        uint256 effectivePriceUSDCents = isGenesis ?
            (tokenPriceUSDCents * (100 - genesisDiscountPercent)) / 100 :
            tokenPriceUSDCents;
        usdCost = (tokenAmount * effectivePriceUSDCents) / (10**18 * 100);
    }

    /**
     * @notice Check if user owns Genesis NFT
     * @param user Address to check
     * @return bool Whether user is a Genesis holder
     */
    function isGenesisHolder(address user) public view returns (bool) {
        return genesisNFT.balanceOf(user) > 0;
    }

    /**
     * @notice Purchase tokens with native currency (ETH or BNB)
     * @param tokenAmount Amount of tokens to purchase (in wei, 18 decimals)
     */
    function buyTokens(uint256 tokenAmount) public payable saleIsActive validPhase {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount >= minPurchase, "Below minimum purchase amount");
        require(tokensSold + tokenAmount <= maxTokensForPreSale, "Exceeds pre-sale limit");

        bool isGenesis = isGenesisHolder(msg.sender);
        uint256 maxPurchase = _getMaxPurchase(isGenesis);

        _validatePhaseAndLimits(tokenAmount, isGenesis, maxPurchase);

        (uint256 nativeCost, uint256 usdCost) = calculatePurchaseCost(tokenAmount, isGenesis, false);
        require(msg.value >= nativeCost, "Insufficient payment sent");

        // Record purchase
        _recordPurchase(msg.sender, tokenAmount, isGenesis);

        // Track payment by token type
        string memory paymentToken = _getChainNativeToken();
        paymentsByToken[msg.sender][paymentToken] += msg.value;

        // Refund excess payment
        if (msg.value > nativeCost) {
            payable(msg.sender).transfer(msg.value - nativeCost);
        }

        emit TokensPurchased(
            msg.sender,
            tokenAmount,
            nativeCost,
            usdCost,
            currentPhase,
            isGenesis,
            paymentToken
        );
    }

    /**
     * @notice Purchase tokens with USDT
     * @param tokenAmount Amount of tokens to purchase (in wei, 18 decimals)
     * @dev User must approve this contract to spend USDT first
     */
    function buyTokensWithUSDT(uint256 tokenAmount) external saleIsActive validPhase {
        require(usdtPaymentsEnabled, "USDT payments not enabled");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount >= minPurchase, "Below minimum purchase amount");
        require(tokensSold + tokenAmount <= maxTokensForPreSale, "Exceeds pre-sale limit");

        bool isGenesis = isGenesisHolder(msg.sender);
        uint256 maxPurchase = _getMaxPurchase(isGenesis);

        _validatePhaseAndLimits(tokenAmount, isGenesis, maxPurchase);

        (uint256 usdtCost, uint256 usdCost) = calculatePurchaseCost(tokenAmount, isGenesis, true);

        // Transfer USDT from buyer to this contract
        require(
            usdtToken.transferFrom(msg.sender, address(this), usdtCost),
            "USDT transfer failed"
        );

        // Record purchase
        _recordPurchase(msg.sender, tokenAmount, isGenesis);

        // Track payment by token type
        paymentsByToken[msg.sender]["USDT"] += usdtCost;

        emit TokensPurchased(
            msg.sender,
            tokenAmount,
            usdtCost,
            usdCost,
            currentPhase,
            isGenesis,
            "USDT"
        );
    }

    /**
     * @notice Internal function to validate phase and purchase limits
     */
    function _validatePhaseAndLimits(
        uint256 tokenAmount,
        bool isGenesis,
        uint256 maxPurchase
    ) internal view {
        if (currentPhase == Phase.GENESIS) {
            require(isGenesis, "Genesis phase: Only NFT holders can participate");
            require(tokensSold + tokenAmount <= genesisPhaseLimit, "Exceeds Genesis phase limit");
        }

        require(
            purchasedAmount[msg.sender] + tokenAmount <= maxPurchase,
            "Exceeds individual purchase limit"
        );
    }

    /**
     * @notice Internal function to record purchase
     */
    function _recordPurchase(address buyer, uint256 tokenAmount, bool isGenesis) internal {
        tokensSold += tokenAmount;
        purchasedAmount[buyer] += tokenAmount;

        if (isGenesis && !hasClaimedGenesisBenefit[buyer]) {
            hasClaimedGenesisBenefit[buyer] = true;
        }
    }

    /**
     * @notice Get maximum purchase amount based on Genesis status
     */
    function _getMaxPurchase(bool isGenesis) internal view returns (uint256) {
        if (currentPhase == Phase.GENESIS) {
            return maxPurchaseGenesis;
        } else if (currentPhase == Phase.PUBLIC) {
            return isGenesis ? maxPurchaseGenesis : maxPurchasePublic;
        }
        revert("Invalid phase");
    }

    /**
     * @notice Get native token name based on chain
     */
    function _getChainNativeToken() internal view returns (string memory) {
        if (keccak256(bytes(chainName)) == keccak256(bytes("Ethereum"))) return "ETH";
        if (keccak256(bytes(chainName)) == keccak256(bytes("BSC"))) return "BNB";
        if (keccak256(bytes(chainName)) == keccak256(bytes("Base"))) return "ETH";
        return "NATIVE";
    }

    /**
     * @notice Calculate vested amount for a user
     * @param user Address to check
     * @return vestedAmount Amount of tokens vested and available to claim
     */
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

    /**
     * @notice Claim vested tokens
     * @dev Only works if HVNA token is on the same chain (e.g., Base)
     */
    function claimTokens() public {
        require(vestingEnabled, "Vesting not enabled yet");
        require(address(hvnaToken) != address(0), "Token claiming not available on this chain");

        uint256 vestedAmount = getVestedAmount(msg.sender);
        uint256 alreadyClaimed = claimedAmount[msg.sender];
        uint256 claimable = vestedAmount - alreadyClaimed;

        require(claimable > 0, "No tokens to claim");

        claimedAmount[msg.sender] += claimable;
        require(hvnaToken.transfer(msg.sender, claimable), "Token transfer failed");

        emit TokensClaimed(msg.sender, claimable);
    }

    /**
     * @notice Get claimable tokens for a user
     * @param user Address to check
     * @return claimableAmount Amount available to claim now
     */
    function getClaimableTokens(address user) public view returns (uint256) {
        uint256 vested = getVestedAmount(user);
        uint256 claimed = claimedAmount[user];
        return vested > claimed ? vested - claimed : 0;
    }

    /**
     * @notice Get total purchased tokens for a user
     * @param user Address to check
     * @return purchasedTokens Total tokens purchased
     */
    function getPurchasedTokens(address user) public view returns (uint256) {
        return purchasedAmount[user];
    }

    /**
     * @notice Get unclaimed tokens for a user
     * @param user Address to check
     * @return unclaimedTokens Total purchased minus claimed
     */
    function getUnclaimedTokens(address user) public view returns (uint256) {
        return purchasedAmount[user] - claimedAmount[user];
    }

    /**
     * @notice Update sale phase based on current timestamp
     */
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

    /**
     * @notice Toggle sale active/inactive (owner only)
     */
    function toggleSale() public onlyOwner {
        saleActive = !saleActive;
    }

    /**
     * @notice Toggle USDT payments on/off (owner only)
     */
    function toggleUSDTPayments() public onlyOwner {
        usdtPaymentsEnabled = !usdtPaymentsEnabled;
        emit USDTPaymentToggled(usdtPaymentsEnabled);
    }

    /**
     * @notice Enable vesting and set start date (owner only)
     */
    function enableVesting() public onlyOwner {
        require(!vestingEnabled, "Vesting already enabled");
        vestingEnabled = true;
        vestingStartDate = block.timestamp;
        emit VestingEnabled(vestingStartDate);
    }

    /**
     * @notice Set vesting start date (owner only, before vesting enabled)
     */
    function setVestingStartDate(uint256 _vestingStartDate) public onlyOwner {
        require(!vestingEnabled, "Cannot change after vesting enabled");
        vestingStartDate = _vestingStartDate;
    }

    /**
     * @notice Update token pricing (owner only)
     */
    function setPricing(uint256 _tokenPriceUSDCents, uint256 _genesisDiscountPercent) public onlyOwner {
        require(_genesisDiscountPercent <= 100, "Invalid discount");
        tokenPriceUSDCents = _tokenPriceUSDCents;
        genesisDiscountPercent = _genesisDiscountPercent;
    }

    /**
     * @notice Update purchase limits (owner only)
     */
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

    /**
     * @notice Update USDT token address (owner only)
     */
    function setUSDTAddress(address _usdtToken) public onlyOwner {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @notice Migrate purchases from old contract (owner only)
     */
    function migratePurchase(address buyer, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        purchasedAmount[buyer] += amount;
        tokensSold += amount;
    }

    /**
     * @notice Withdraw native currency (ETH/BNB) to owner
     */
    function withdrawNative() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @notice Withdraw USDT to owner
     */
    function withdrawUSDT() public onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(owner, balance), "USDT transfer failed");
    }

    /**
     * @notice Withdraw unsold HVNA tokens (only when sale ended or inactive)
     */
    function withdrawUnsoldTokens() public onlyOwner {
        require(currentPhase == Phase.ENDED || !saleActive, "Pre-sale still active");
        require(address(hvnaToken) != address(0), "Token not available on this chain");

        uint256 contractBalance = hvnaToken.balanceOf(address(this));
        uint256 unclaimedTotal = tokensSold - _getTotalClaimed();
        uint256 unsold = contractBalance - unclaimedTotal;

        require(hvnaToken.transfer(owner, unsold), "Token transfer failed");
    }

    /**
     * @notice Get total claimed tokens (simplified - in production use state variable)
     */
    function _getTotalClaimed() internal pure returns (uint256) {
        return 0; // Simplified - track with state variable in production
    }

    /**
     * @notice Emergency function to recover stuck ERC20 tokens
     */
    function recoverERC20(address tokenAddress, uint256 amount) public onlyOwner {
        require(tokenAddress != address(hvnaToken), "Cannot recover HVNA token");
        require(tokenAddress != address(usdtToken), "Use withdrawUSDT instead");
        IERC20(tokenAddress).transfer(owner, amount);
    }

    /**
     * @notice Get contract information
     */
    function getContractInfo() public view returns (
        string memory chain,
        uint256 sold,
        uint256 maxTokens,
        uint256 currentPrice,
        bool active,
        Phase phase,
        bool usdtEnabled
    ) {
        return (
            chainName,
            tokensSold,
            maxTokensForPreSale,
            tokenPriceUSDCents,
            saleActive,
            currentPhase,
            usdtPaymentsEnabled
        );
    }
}
