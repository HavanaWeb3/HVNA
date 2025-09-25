// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GenesisMarketplace
 * @dev Marketplace contract for trading Genesis Elephant NFTs
 * @author HVNA Team
 */
contract GenesisMarketplace is ReentrancyGuard, Ownable {
    IERC721 public immutable genesisNFT;
    
    // Events
    event NFTListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTPurchased(uint256 indexed tokenId, uint256 price, address indexed buyer, address indexed seller);
    event NFTUnlisted(uint256 indexed tokenId, address indexed seller);
    event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
    
    // Listing structure
    struct Listing {
        uint256 price;      // Price in wei
        address seller;     // Address of seller
        bool active;        // Whether listing is active
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Marketplace fee (2.5% = 250 basis points)
    uint256 public marketplaceFee = 250;
    uint256 public constant MAX_FEE = 1000; // 10% maximum
    
    constructor(address _genesisNFT) Ownable(msg.sender) {
        genesisNFT = IERC721(_genesisNFT);
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId The ID of the token to list
     * @param price The price in wei
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than 0");
        require(genesisNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            genesisNFT.isApprovedForAll(msg.sender, address(this)) || 
            genesisNFT.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        listings[tokenId] = Listing({
            price: price,
            seller: msg.sender,
            active: true
        });
        
        emit NFTListed(tokenId, price, msg.sender);
    }
    
    /**
     * @dev Buy an NFT
     * @param tokenId The ID of the token to buy
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "NFT not for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        require(genesisNFT.ownerOf(tokenId) == listing.seller, "Seller no longer owns NFT");
        
        // Calculate fees
        uint256 fee = (listing.price * marketplaceFee) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Remove listing
        delete listings[tokenId];
        
        // Add seller amount to pending withdrawals
        pendingWithdrawals[listing.seller] += sellerAmount;
        
        // Add marketplace fee to owner withdrawals
        pendingWithdrawals[owner()] += fee;
        
        // Transfer NFT
        genesisNFT.safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        // Refund excess payment
        if (msg.value > listing.price) {
            pendingWithdrawals[msg.sender] += (msg.value - listing.price);
        }
        
        emit NFTPurchased(tokenId, listing.price, msg.sender, listing.seller);
    }
    
    /**
     * @dev Unlist an NFT
     * @param tokenId The ID of the token to unlist
     */
    function unlistNFT(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        require(listing.active, "NFT not listed");
        require(
            listing.seller == msg.sender || owner() == msg.sender, 
            "Not seller or owner"
        );
        
        delete listings[tokenId];
        emit NFTUnlisted(tokenId, listing.seller);
    }
    
    /**
     * @dev Update the price of a listed NFT
     * @param tokenId The ID of the token to update
     * @param newPrice The new price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than 0");
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFT not listed");
        require(listing.seller == msg.sender, "Not seller");
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(tokenId, oldPrice, newPrice);
    }
    
    /**
     * @dev Withdraw pending payments
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Emergency withdraw all funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Update marketplace fee (owner only)
     * @param newFee New fee in basis points (100 = 1%)
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        marketplaceFee = newFee;
    }
    
    /**
     * @dev Batch list multiple NFTs (owner only for initial setup)
     * @param tokenIds Array of token IDs to list
     * @param prices Array of prices in wei
     */
    function batchListNFTs(uint256[] calldata tokenIds, uint256[] calldata prices) external onlyOwner {
        require(tokenIds.length == prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(prices[i] > 0, "Price must be greater than 0");
            require(genesisNFT.ownerOf(tokenIds[i]) == msg.sender, "Not token owner");
            
            listings[tokenIds[i]] = Listing({
                price: prices[i],
                seller: msg.sender,
                active: true
            });
            
            emit NFTListed(tokenIds[i], prices[i], msg.sender);
        }
    }
    
    /**
     * @dev Get listing details
     * @param tokenId The token ID to check
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }
    
    /**
     * @dev Check if an NFT is for sale
     * @param tokenId The token ID to check
     */
    function isForSale(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].active;
    }
    
    /**
     * @dev Get the price of an NFT
     * @param tokenId The token ID to check
     */
    function getPrice(uint256 tokenId) external view returns (uint256) {
        require(listings[tokenId].active, "NFT not for sale");
        return listings[tokenId].price;
    }
    
    /**
     * @dev Get multiple listings at once
     * @param tokenIds Array of token IDs to check
     */
    function getListings(uint256[] calldata tokenIds) external view returns (Listing[] memory) {
        Listing[] memory result = new Listing[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            result[i] = listings[tokenIds[i]];
        }
        return result;
    }
}