// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title HVNAToken
 * @dev ERC20 token for Havana Elephant Brand ecosystem
 * Total supply: 100,000,000 HVNA tokens
 * Features: Burnable, Pausable, Access Control, Anti-reentrancy
 */
contract HVNAToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 ethPaid);
    event TokensWithdrawn(address indexed owner, uint256 amount);
    
    constructor() ERC20("Havana Token", "HVNA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Mint the entire supply to the contract deployer
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev Pause token transfers (emergency function)
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Hook that is called before any token transfer
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Returns the number of decimals used to get user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
