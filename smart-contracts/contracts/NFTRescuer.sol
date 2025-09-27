// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC3156FlashBorrower {
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32);
}

interface IERC3156FlashLender {
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external returns (bool);
}

contract NFTRescuer is IERC3156FlashBorrower, Ownable {
    IERC3156FlashLender public immutable FLASH_LENDER;
    address public immutable WETH;
    
    bytes32 private constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
    
    struct RescueData {
        address compromisedWallet;
        address safeWallet;
        address[] nftContracts;
        uint256[] tokenIds;
    }
    
    event NFTsRescued(address indexed from, address indexed to, uint256 count);
    
    constructor(address _flashLender, address _weth) {
        FLASH_LENDER = IERC3156FlashLender(_flashLender);
        WETH = _weth;
    }
    
    function rescueNFTs(
        address compromisedWallet,
        address safeWallet,
        address[] calldata nftContracts,
        uint256[] calldata tokenIds
    ) external onlyOwner {
        require(nftContracts.length == tokenIds.length, "Array length mismatch");
        require(nftContracts.length > 0, "No NFTs to rescue");
        
        // Estimate gas needed for all transfers
        uint256 gasNeeded = nftContracts.length * 100000; // ~100k gas per transfer
        uint256 ethNeeded = gasNeeded * tx.gasprice;
        
        // Add some buffer
        ethNeeded = ethNeeded * 120 / 100; // 20% buffer
        
        RescueData memory rescueData = RescueData({
            compromisedWallet: compromisedWallet,
            safeWallet: safeWallet,
            nftContracts: nftContracts,
            tokenIds: tokenIds
        });
        
        bytes memory data = abi.encode(rescueData);
        
        // Execute flashloan
        FLASH_LENDER.flashLoan(
            IERC3156FlashBorrower(this),
            WETH,
            ethNeeded,
            data
        );
    }
    
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        require(msg.sender == address(FLASH_LENDER), "Untrusted lender");
        require(initiator == address(this), "Untrusted initiator");
        
        RescueData memory rescueData = abi.decode(data, (RescueData));
        
        // Convert WETH to ETH for gas
        IWETH(WETH).withdraw(amount);
        
        // Transfer ETH to compromised wallet for gas
        payable(rescueData.compromisedWallet).transfer(amount - fee);
        
        // Execute NFT transfers
        for (uint256 i = 0; i < rescueData.nftContracts.length; i++) {
            IERC721 nft = IERC721(rescueData.nftContracts[i]);
            
            // Transfer NFT from compromised wallet to safe wallet
            nft.safeTransferFrom(
                rescueData.compromisedWallet,
                rescueData.safeWallet,
                rescueData.tokenIds[i]
            );
        }
        
        emit NFTsRescued(
            rescueData.compromisedWallet, 
            rescueData.safeWallet, 
            rescueData.nftContracts.length
        );
        
        // Convert remaining ETH back to WETH for repayment
        IWETH(WETH).deposit{value: amount + fee}();
        
        // Approve flashloan repayment
        IERC20(WETH).approve(address(FLASH_LENDER), amount + fee);
        
        return CALLBACK_SUCCESS;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyWithdrawToken(address token) external onlyOwner {
        IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
    }
    
    receive() external payable {}
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}