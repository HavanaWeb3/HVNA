// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function burn(uint256 amount) external;
}

contract Treasury {
    IERC20 public hvnaToken;
    address public owner;
    address public governanceContract;
    
    // Revenue tracking
    uint256 public totalRevenue;
    uint256 public totalTokensBurned;
    uint256 public totalTokensBought;
    
    // Burn percentages from different revenue sources
    uint256 public productSalesBurnRate = 200; // 2% = 200 basis points
    uint256 public nftRoyaltiesBurnRate = 5000; // 50% = 5000 basis points
    uint256 public contentFlowBurnRate = 3000; // 30% = 3000 basis points
    
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    
    // Revenue categories
    enum RevenueSource {
        PRODUCT_SALES,
        NFT_ROYALTIES,
        CONTENTFLOW_ADS,
        TOKEN_SALE,
        PARTNERSHIPS
    }
    
    struct RevenueEntry {
        uint256 amount;
        RevenueSource source;
        uint256 timestamp;
        uint256 tokensBurned;
        bool processed;
    }
    
    mapping(uint256 => RevenueEntry) public revenueEntries;
    uint256 public revenueCounter = 0;
    
    // Emergency controls
    bool public paused = false;
    bool public burnEnabled = true;
    
    event RevenueReceived(uint256 indexed entryId, uint256 amount, RevenueSource source);
    event TokensBurned(uint256 amount, RevenueSource source);
    event TokensBought(uint256 ethAmount, uint256 tokensReceived);
    event BurnRateUpdated(RevenueSource source, uint256 newRate);
    event EmergencyWithdraw(address to, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyGovernance() {
        require(msg.sender == governanceContract || msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier notPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    constructor(address _hvnaToken) {
        hvnaToken = IERC20(_hvnaToken);
        owner = msg.sender;
    }
    
    // Receive ETH revenue and process burns
    function receiveRevenue(RevenueSource source) public payable notPaused {
        require(msg.value > 0, "No ETH sent");
        
        revenueCounter++;
        uint256 entryId = revenueCounter;
        
        // Calculate burn amount based on source
        uint256 burnRate = getBurnRate(source);
        uint256 burnAmount = (msg.value * burnRate) / BASIS_POINTS;
        
        // Store revenue entry
        revenueEntries[entryId] = RevenueEntry({
            amount: msg.value,
            source: source,
            timestamp: block.timestamp,
            tokensBurned: 0,
            processed: false
        });
        
        totalRevenue += msg.value;
        
        // Execute burn if enabled and there's ETH to spend
        if (burnEnabled && burnAmount > 0) {
            _buyAndBurn(burnAmount, source);
            revenueEntries[entryId].tokensBurned = burnAmount; // This would be actual tokens burned
            revenueEntries[entryId].processed = true;
        }
        
        emit RevenueReceived(entryId, msg.value, source);
    }
    
    // Internal function to buy and burn tokens
    function _buyAndBurn(uint256 ethAmount, RevenueSource source) internal {
        // In a real implementation, this would:
        // 1. Use a DEX router to swap ETH for HVNA tokens
        // 2. Burn the acquired tokens
        
        // For this demo, we'll simulate the process
        // Assuming 1 ETH = 100,000 HVNA for calculation
        uint256 simulatedTokenAmount = ethAmount * 100000;
        
        // If we have tokens in treasury, burn them
        uint256 treasuryBalance = hvnaToken.balanceOf(address(this));
        if (treasuryBalance > 0) {
            uint256 burnAmount = simulatedTokenAmount > treasuryBalance ? treasuryBalance : simulatedTokenAmount;
            hvnaToken.burn(burnAmount);
            totalTokensBurned += burnAmount;
            emit TokensBurned(burnAmount, source);
        }
        
        totalTokensBought += simulatedTokenAmount;
        emit TokensBought(ethAmount, simulatedTokenAmount);
    }
    
    // Manual burn function for governance
    function manualBurn(uint256 amount) public onlyGovernance {
        require(burnEnabled, "Burning disabled");
        uint256 balance = hvnaToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient tokens");
        
        hvnaToken.burn(amount);
        totalTokensBurned += amount;
        
        emit TokensBurned(amount, RevenueSource.PARTNERSHIPS); // Use partnerships as default
    }
    
    // Get burn rate for revenue source
    function getBurnRate(RevenueSource source) public view returns (uint256) {
        if (source == RevenueSource.PRODUCT_SALES) {
            return productSalesBurnRate;
        } else if (source == RevenueSource.NFT_ROYALTIES) {
            return nftRoyaltiesBurnRate;
        } else if (source == RevenueSource.CONTENTFLOW_ADS) {
            return contentFlowBurnRate;
        }
        return 0; // No burn for token sales and partnerships by default
    }
    
    // Admin functions
    function setBurnRate(RevenueSource source, uint256 newRate) public onlyGovernance {
        require(newRate <= BASIS_POINTS, "Rate too high");
        
        if (source == RevenueSource.PRODUCT_SALES) {
            productSalesBurnRate = newRate;
        } else if (source == RevenueSource.NFT_ROYALTIES) {
            nftRoyaltiesBurnRate = newRate;
        } else if (source == RevenueSource.CONTENTFLOW_ADS) {
            contentFlowBurnRate = newRate;
        }
        
        emit BurnRateUpdated(source, newRate);
    }
    
    function setGovernanceContract(address _governance) public onlyOwner {
        governanceContract = _governance;
    }
    
    function toggleBurning() public onlyOwner {
        burnEnabled = !burnEnabled;
    }
    
    function togglePause() public onlyOwner {
        paused = !paused;
    }
    
    // Treasury management
    function withdrawETH(address payable to, uint256 amount) public onlyGovernance {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit EmergencyWithdraw(to, amount);
    }
    
    function withdrawTokens(address to, uint256 amount) public onlyGovernance {
        require(hvnaToken.transfer(to, amount), "Transfer failed");
    }
    
    // View functions
    function getBalance() public view returns (uint256 ethBalance, uint256 tokenBalance) {
        return (address(this).balance, hvnaToken.balanceOf(address(this)));
    }
    
    function getRevenueEntry(uint256 entryId) public view returns (
        uint256 amount,
        RevenueSource source,
        uint256 timestamp,
        uint256 tokensBurned,
        bool processed
    ) {
        RevenueEntry storage entry = revenueEntries[entryId];
        return (entry.amount, entry.source, entry.timestamp, entry.tokensBurned, entry.processed);
    }
    
    // Fallback function to receive ETH
    receive() external payable {
        // Default to product sales revenue
        receiveRevenue(RevenueSource.PRODUCT_SALES);
    }
}