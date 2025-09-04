// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenSale {
    IERC20 public hvnaToken;
    address public owner;
    
    uint256 public tokenPrice = 0.0001 ether; // Price per HVNA token in ETH
    uint256 public tokensSold = 0;
    uint256 public maxTokensForSale = 30000000 * 10**18; // 30% of total supply
    
    bool public saleActive = true;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event SaleStatusChanged(bool active);
    event PriceUpdated(uint256 newPrice);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier saleIsActive() {
        require(saleActive, "Sale is not active");
        _;
    }
    
    constructor(address _hvnaTokenAddress) {
        hvnaToken = IERC20(_hvnaTokenAddress);
        owner = msg.sender;
    }
    
    function buyTokens(uint256 tokenAmount) public payable saleIsActive {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokensSold + tokenAmount <= maxTokensForSale, "Not enough tokens available");
        
        uint256 cost = (tokenAmount * tokenPrice) / 10**18;
        require(msg.value >= cost, "Insufficient ETH sent");
        
        require(hvnaToken.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        tokensSold += tokenAmount;
        
        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
        
        emit TokensPurchased(msg.sender, tokenAmount, cost);
    }
    
    function setTokenPrice(uint256 newPrice) public onlyOwner {
        tokenPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    function toggleSale() public onlyOwner {
        saleActive = !saleActive;
        emit SaleStatusChanged(saleActive);
    }
    
    function withdrawETH() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    function withdrawUnsoldTokens() public onlyOwner {
        uint256 remainingTokens = hvnaToken.balanceOf(address(this));
        require(hvnaToken.transfer(owner, remainingTokens), "Token transfer failed");
    }
    
    function getRemainingTokens() public view returns (uint256) {
        return maxTokensForSale - tokensSold;
    }
}