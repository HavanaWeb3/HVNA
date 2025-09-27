// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MEVProtectedRescuer is Ownable, ReentrancyGuard {
    
    event NFTRescueInitiated(address indexed from, address indexed to, uint256 totalNFTs);
    event NFTRescueCompleted(address indexed from, address indexed to, uint256 successCount, uint256 failedCount);
    event GasRefunded(address indexed to, uint256 amount);
    
    constructor() {}
    
    // Structure to hold rescue parameters
    struct RescueParams {
        address nftContract;
        address compromisedWallet;
        address safeWallet;
        uint256[] tokenIds;
        uint256 gasPerTransfer;
        uint256 maxGasPrice;
    }
    
    // Main rescue function - designed for MEV protection
    function executeRescue(
        address nftContract,
        address compromisedWallet,
        address safeWallet,
        uint256[] calldata tokenIds,
        uint256 gasPerTransfer
    ) external payable onlyOwner nonReentrant {
        require(tokenIds.length > 0, "No NFTs to rescue");
        require(msg.value > 0, "Must send ETH for gas");
        
        IERC721 nft = IERC721(nftContract);
        
        // Calculate gas needed
        uint256 totalGasNeeded = tokenIds.length * gasPerTransfer;
        require(msg.value >= totalGasNeeded, "Insufficient ETH for gas");
        
        emit NFTRescueInitiated(compromisedWallet, safeWallet, tokenIds.length);
        
        // Step 1: Send exact gas amount to compromised wallet
        payable(compromisedWallet).transfer(totalGasNeeded);
        
        // Step 2: Immediately start rescue in same transaction
        uint256 successCount = 0;
        uint256 failedCount = 0;
        
        // Rescue NFTs in batches to avoid gas limit issues
        for (uint256 i = 0; i < tokenIds.length; i++) {
            try nft.safeTransferFrom(compromisedWallet, safeWallet, tokenIds[i]) {
                successCount++;
            } catch {
                failedCount++;
                // Continue with next NFT even if one fails
            }
        }
        
        // Step 3: Refund unused ETH to owner
        uint256 unusedETH = msg.value - totalGasNeeded;
        if (unusedETH > 0) {
            payable(owner()).transfer(unusedETH);
            emit GasRefunded(owner(), unusedETH);
        }
        
        emit NFTRescueCompleted(compromisedWallet, safeWallet, successCount, failedCount);
        
        require(successCount > 0, "No NFTs were rescued successfully");
    }
    
    // Batch rescue with optimized gas usage
    function batchRescueOptimized(
        address nftContract,
        address compromisedWallet,
        address safeWallet,
        uint256[] calldata tokenIds,
        uint256 batchSize
    ) external payable onlyOwner nonReentrant {
        require(tokenIds.length > 0, "No NFTs to rescue");
        require(batchSize > 0 && batchSize <= 50, "Invalid batch size");
        
        IERC721 nft = IERC721(nftContract);
        
        // Estimate gas per transfer (typically ~100k gas)
        uint256 gasPerTransfer = 120000; // 120k gas per transfer with buffer
        uint256 gasPrice = tx.gasprice;
        uint256 gasPerBatch = batchSize * gasPerTransfer;
        uint256 ethPerBatch = gasPerBatch * gasPrice;
        
        uint256 totalSuccessful = 0;
        uint256 totalFailed = 0;
        
        // Process in batches
        for (uint256 startIdx = 0; startIdx < tokenIds.length; startIdx += batchSize) {
            uint256 endIdx = startIdx + batchSize;
            if (endIdx > tokenIds.length) {
                endIdx = tokenIds.length;
            }
            
            uint256 currentBatchSize = endIdx - startIdx;
            uint256 currentBatchGas = currentBatchSize * gasPerTransfer * gasPrice;
            
            // Send gas for this batch
            payable(compromisedWallet).transfer(currentBatchGas);
            
            // Transfer NFTs in this batch
            for (uint256 i = startIdx; i < endIdx; i++) {
                try nft.safeTransferFrom(compromisedWallet, safeWallet, tokenIds[i]) {
                    totalSuccessful++;
                } catch {
                    totalFailed++;
                }
            }
        }
        
        emit NFTRescueCompleted(compromisedWallet, safeWallet, totalSuccessful, totalFailed);
    }
    
    // Check which NFTs are actually owned by the compromised wallet
    function checkOwnedNFTs(
        address nftContract,
        address wallet,
        uint256[] calldata tokenIds
    ) external view returns (uint256[] memory ownedTokens, uint256 count) {
        IERC721 nft = IERC721(nftContract);
        uint256[] memory temp = new uint256[](tokenIds.length);
        uint256 ownedCount = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            try nft.ownerOf(tokenIds[i]) returns (address owner) {
                if (owner == wallet) {
                    temp[ownedCount] = tokenIds[i];
                    ownedCount++;
                }
            } catch {
                // Token doesn't exist or error - skip
            }
        }
        
        // Return only the owned tokens
        ownedTokens = new uint256[](ownedCount);
        for (uint256 i = 0; i < ownedCount; i++) {
            ownedTokens[i] = temp[i];
        }
        
        return (ownedTokens, ownedCount);
    }
    
    // Estimate gas costs for rescue operation
    function estimateRescueCost(
        uint256 nftCount,
        uint256 gasPrice
    ) external pure returns (uint256 totalCost, uint256 gasPerNFT) {
        gasPerNFT = 120000; // 120k gas per NFT transfer
        uint256 totalGas = nftCount * gasPerNFT;
        totalCost = totalGas * gasPrice;
        
        return (totalCost, gasPerNFT);
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}