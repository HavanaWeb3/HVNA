// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
}

contract LoyaltyManager {
    IERC20 public hvnaToken;
    IERC721 public nftContract;
    
    address public owner;
    
    // Token holding tiers for discounts
    uint256 public constant BRONZE_THRESHOLD = 1000 * 10**18;    // 1,000 HVNA
    uint256 public constant SILVER_THRESHOLD = 5000 * 10**18;    // 5,000 HVNA  
    uint256 public constant GOLD_THRESHOLD = 10000 * 10**18;     // 10,000 HVNA
    uint256 public constant PLATINUM_THRESHOLD = 25000 * 10**18; // 25,000 HVNA
    
    // NFT tier mapping (tokenId => tier)
    mapping(uint256 => uint8) public nftTier; // 1=Silver, 2=Gold, 3=Platinum
    
    // Discount percentages
    mapping(uint8 => uint256) public discountPercentages;
    
    // Shopify integration
    mapping(address => string) public shopifyCustomerIds;
    mapping(string => address) public customerWallets;
    
    event DiscountCalculated(address user, uint256 discount, string reason);
    event CustomerLinked(address wallet, string shopifyId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    constructor(address _hvnaToken, address _nftContract) {
        hvnaToken = IERC20(_hvnaToken);
        nftContract = IERC721(_nftContract);
        owner = msg.sender;
        
        // Set default discount percentages
        discountPercentages[0] = 5;   // Token holders: 5%
        discountPercentages[1] = 10;  // Silver NFT: 10%
        discountPercentages[2] = 25;  // Gold NFT: 25%
        discountPercentages[3] = 50;  // Platinum NFT: 50%
    }
    
    // Link Shopify customer to wallet
    function linkCustomer(string memory shopifyCustomerId, address wallet) public onlyOwner {
        shopifyCustomerIds[wallet] = shopifyCustomerId;
        customerWallets[shopifyCustomerId] = wallet;
        emit CustomerLinked(wallet, shopifyCustomerId);
    }
    
    // Set NFT tiers (batch function for initial setup)
    function setNFTTiers(uint256[] memory tokenIds, uint8[] memory tiers) public onlyOwner {
        require(tokenIds.length == tiers.length, "Array length mismatch");
        for (uint i = 0; i < tokenIds.length; i++) {
            require(tiers[i] <= 3, "Invalid tier");
            nftTier[tokenIds[i]] = tiers[i];
        }
    }
    
    // Calculate discount for a user
    function calculateDiscount(address user) public view returns (uint256 discount, string memory reason) {
        // Check for NFT-based discounts first (highest priority)
        uint256 nftBalance = nftContract.balanceOf(user);
        uint256 highestNFTDiscount = 0;
        uint8 highestTier = 0;
        
        if (nftBalance > 0) {
            // In a real implementation, you'd iterate through owned NFTs
            // For now, we'll check if they own any NFTs and assume best case
            // This would need to be enhanced with enumeration
            highestTier = 3; // Assume platinum for demo
            highestNFTDiscount = discountPercentages[highestTier];
        }
        
        // Check token-based discounts
        uint256 tokenBalance = hvnaToken.balanceOf(user);
        uint256 tokenDiscount = 0;
        
        if (tokenBalance >= PLATINUM_THRESHOLD) {
            tokenDiscount = 20; // Additional discount for high token holders
        } else if (tokenBalance >= GOLD_THRESHOLD) {
            tokenDiscount = 15;
        } else if (tokenBalance >= SILVER_THRESHOLD) {
            tokenDiscount = 10;
        } else if (tokenBalance >= BRONZE_THRESHOLD) {
            tokenDiscount = 5;
        }
        
        // Return the higher discount
        if (highestNFTDiscount >= tokenDiscount) {
            return (highestNFTDiscount, string(abi.encodePacked("NFT Tier ", uintToString(highestTier))));
        } else {
            return (tokenDiscount, "Token Holder");
        }
    }
    
    // Shopify integration: Get discount by customer ID
    function getDiscountByCustomer(string memory shopifyCustomerId) public view returns (uint256 discount, string memory reason) {
        address wallet = customerWallets[shopifyCustomerId];
        if (wallet == address(0)) {
            return (0, "Not linked");
        }
        return calculateDiscount(wallet);
    }
    
    // Verify NFT ownership for custom printing
    function verifyNFTOwnership(address user, uint256 tokenId) public view returns (bool, uint8) {
        try nftContract.ownerOf(tokenId) returns (address owner) {
            if (owner == user) {
                return (true, nftTier[tokenId]);
            }
        } catch {
            return (false, 0);
        }
        return (false, 0);
    }
    
    // Admin functions
    function updateDiscountPercentage(uint8 tier, uint256 percentage) public onlyOwner {
        require(percentage <= 100, "Invalid percentage");
        discountPercentages[tier] = percentage;
    }
    
    // Helper function to convert uint to string
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}