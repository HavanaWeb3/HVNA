// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract DiscountManager {
    IERC20 public hvnaToken;
    IERC721 public genesisNFT;
    address public owner;
    
    // USD thresholds in cents to avoid decimals (e.g., $150 = 15000 cents)
    uint256 public tier1ThresholdCents = 15000; // $150
    uint256 public tier2ThresholdCents = 25000; // $250  
    uint256 public tier3ThresholdCents = 50000; // $500
    
    // Token price in cents ($0.01 = 1 cent)
    uint256 public tokenPriceCents = 1;
    
    // Discount percentages
    uint256 public genesisBaseDiscount = 30; // 30% for Genesis NFT
    uint256 public tokenBonusDiscount = 10; // Additional 10% for Genesis + tokens
    
    struct DiscountInfo {
        bool isGenesisHolder;
        uint256 tokenBalance;
        uint256 tokenValueUSD;
        uint256 tokenTier; // 0=none, 1=10%, 2=20%, 3=30%
        uint256 baseDiscount;
        uint256 bonusDiscount;
        uint256 totalDiscount;
    }
    
    event DiscountCalculated(address indexed user, uint256 totalDiscount, bool isGenesis, uint256 tokenTier);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor(address _hvnaTokenAddress, address _genesisNFTAddress) {
        hvnaToken = IERC20(_hvnaTokenAddress);
        genesisNFT = IERC721(_genesisNFTAddress);
        owner = msg.sender;
    }
    
    // Calculate user's discount eligibility
    function getDiscountInfo(address user) public view returns (DiscountInfo memory) {
        DiscountInfo memory info;
        
        // Check Genesis NFT status
        info.isGenesisHolder = genesisNFT.balanceOf(user) > 0;
        
        // Get token balance
        info.tokenBalance = hvnaToken.balanceOf(user);
        
        // Calculate USD value of tokens (balance * price in cents)
        info.tokenValueUSD = (info.tokenBalance * tokenPriceCents) / 10**18; // Convert from wei
        
        // Determine token tier
        if (info.tokenValueUSD >= tier3ThresholdCents) {
            info.tokenTier = 3; // 30% tier
        } else if (info.tokenValueUSD >= tier2ThresholdCents) {
            info.tokenTier = 2; // 20% tier
        } else if (info.tokenValueUSD >= tier1ThresholdCents) {
            info.tokenTier = 1; // 10% tier
        } else {
            info.tokenTier = 0; // No token discount
        }
        
        // Calculate discounts based on stacking rules
        if (info.isGenesisHolder) {
            info.baseDiscount = genesisBaseDiscount; // 30%
            // Genesis holders get additional 10% if they hold $150+ in tokens
            info.bonusDiscount = (info.tokenTier > 0) ? tokenBonusDiscount : 0;
        } else {
            info.baseDiscount = 0;
            // Non-Genesis holders get token tier discount directly
            if (info.tokenTier == 1) info.bonusDiscount = 10;
            else if (info.tokenTier == 2) info.bonusDiscount = 20;
            else if (info.tokenTier == 3) info.bonusDiscount = 30;
            else info.bonusDiscount = 0;
        }
        
        info.totalDiscount = info.baseDiscount + info.bonusDiscount;
        
        return info;
    }
    
    // Get just the total discount percentage for external integration
    function getTotalDiscount(address user) external view returns (uint256) {
        DiscountInfo memory info = getDiscountInfo(user);
        return info.totalDiscount;
    }
    
    // Check if user qualifies for any discount
    function hasDiscountEligibility(address user) public view returns (bool) {
        require(user != address(0), "Invalid user address");
        DiscountInfo memory info = getDiscountInfo(user);
        return info.totalDiscount > 0;
    }
    
    // Get token tier only
    function getTokenTier(address user) external view returns (uint256) {
        DiscountInfo memory info = getDiscountInfo(user);
        return info.tokenTier;
    }
    
    // Calculate tokens needed for next tier
    function getTokensNeededForNextTier(address user) external view returns (uint256) {
        DiscountInfo memory info = getDiscountInfo(user);
        
        uint256 nextThreshold;
        if (info.tokenTier == 0) {
            nextThreshold = tier1ThresholdCents; // Need $150
        } else if (info.tokenTier == 1) {
            nextThreshold = tier2ThresholdCents; // Need $250
        } else if (info.tokenTier == 2) {
            nextThreshold = tier3ThresholdCents; // Need $500
        } else {
            return 0; // Already at max tier
        }
        
        uint256 tokensNeeded = (nextThreshold * 10**18) / tokenPriceCents;
        return tokensNeeded > info.tokenBalance ? tokensNeeded - info.tokenBalance : 0;
    }
    
    // Admin functions
    function updateThresholds(
        uint256 _tier1Cents,
        uint256 _tier2Cents,
        uint256 _tier3Cents
    ) external onlyOwner {
        tier1ThresholdCents = _tier1Cents;
        tier2ThresholdCents = _tier2Cents;
        tier3ThresholdCents = _tier3Cents;
    }
    
    function updateTokenPrice(uint256 _tokenPriceCents) external onlyOwner {
        tokenPriceCents = _tokenPriceCents;
    }
    
    function updateDiscountRates(
        uint256 _genesisBase,
        uint256 _tokenBonus
    ) external onlyOwner {
        genesisBaseDiscount = _genesisBase;
        tokenBonusDiscount = _tokenBonus;
    }
    
    // View functions for frontend/API integration
    function getThresholds() external view returns (uint256, uint256, uint256) {
        return (tier1ThresholdCents, tier2ThresholdCents, tier3ThresholdCents);
    }
    
    function getDiscountBreakdown(address user) external view returns (
        bool isGenesis,
        uint256 tokenBalance,
        uint256 tokenValueUSD,
        uint256 tokenTier,
        uint256 baseDiscount,
        uint256 bonusDiscount,
        uint256 totalDiscount,
        uint256 tokensForNextTier
    ) {
        DiscountInfo memory info = getDiscountInfo(user);
        return (
            info.isGenesisHolder,
            info.tokenBalance,
            info.tokenValueUSD,
            info.tokenTier,
            info.baseDiscount,
            info.bonusDiscount,
            info.totalDiscount,
            this.getTokensNeededForNextTier(user)
        );
    }
}