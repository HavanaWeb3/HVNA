// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFTRescuer is Ownable {
    
    event NFTsRescued(address indexed from, address indexed to, uint256 count);
    
    constructor() {}
    
    function rescueNFTs(
        address nftContract,
        address compromisedWallet,
        address safeWallet,
        uint256[] calldata tokenIds
    ) external payable onlyOwner {
        require(tokenIds.length > 0, "No NFTs to rescue");
        
        IERC721 nft = IERC721(nftContract);
        uint256 successCount = 0;
        
        // Send ETH to compromised wallet for gas
        if (msg.value > 0) {
            payable(compromisedWallet).transfer(msg.value);
        }
        
        // Attempt to transfer each NFT
        for (uint256 i = 0; i < tokenIds.length; i++) {
            try nft.safeTransferFrom(compromisedWallet, safeWallet, tokenIds[i]) {
                successCount++;
            } catch {
                // Skip failed transfers
                continue;
            }
        }
        
        emit NFTsRescued(compromisedWallet, safeWallet, successCount);
    }
    
    function bulkRescueWithTiming(
        address nftContract,
        address compromisedWallet,
        address safeWallet,
        uint256[] calldata tokenIds,
        uint256 gasAmount
    ) external payable onlyOwner {
        require(tokenIds.length > 0, "No NFTs to rescue");
        require(msg.value >= gasAmount, "Insufficient ETH for gas");
        
        IERC721 nft = IERC721(nftContract);
        
        // Send ETH to compromised wallet
        payable(compromisedWallet).transfer(gasAmount);
        
        // Immediately start transferring NFTs in same block
        uint256 successCount = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            try nft.safeTransferFrom(compromisedWallet, safeWallet, tokenIds[i]) {
                successCount++;
            } catch {
                continue;
            }
        }
        
        emit NFTsRescued(compromisedWallet, safeWallet, successCount);
    }
    
    // Check which NFTs a wallet owns
    function checkNFTOwnership(
        address nftContract,
        address wallet,
        uint256[] calldata tokenIds
    ) external view returns (uint256[] memory ownedTokens) {
        IERC721 nft = IERC721(nftContract);
        uint256[] memory temp = new uint256[](tokenIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            try nft.ownerOf(tokenIds[i]) returns (address owner) {
                if (owner == wallet) {
                    temp[count] = tokenIds[i];
                    count++;
                }
            } catch {
                continue;
            }
        }
        
        // Return only the owned tokens
        ownedTokens = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ownedTokens[i] = temp[i];
        }
    }
    
    // Emergency withdraw
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}