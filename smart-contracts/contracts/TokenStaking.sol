// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract TokenStaking {
    IERC20 public hvnaToken;
    IERC721 public nftContract;
    address public owner;
    
    // Staking pools
    struct StakingPool {
        uint256 id;
        string name;
        uint256 minStakeAmount;
        uint256 rewardRate; // Annual percentage rate in basis points
        uint256 lockPeriod; // In seconds
        bool requiresNFT;
        bool isActive;
        uint256 totalStaked;
        uint256 totalRewardsDistributed;
    }
    
    // User stakes
    struct Stake {
        uint256 poolId;
        uint256 amount;
        uint256 timestamp;
        uint256 lastClaimTimestamp;
        uint256 totalClaimed;
        bool isActive;
    }
    
    // Mappings
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => mapping(uint256 => Stake)) public userStakes; // user => poolId => stake
    mapping(address => uint256[]) public userActivePools;
    mapping(uint256 => address[]) public poolStakers;
    
    uint256 public poolCounter = 0;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    // Emergency controls
    bool public stakingPaused = false;
    bool public claimingPaused = false;
    
    event PoolCreated(uint256 indexed poolId, string name, uint256 rewardRate);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);
    event PoolUpdated(uint256 indexed poolId, uint256 newRewardRate, bool isActive);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier notPaused() {
        require(!stakingPaused, "Staking paused");
        _;
    }
    
    modifier claimingEnabled() {
        require(!claimingPaused, "Claiming paused");
        _;
    }
    
    constructor(address _hvnaToken, address _nftContract) {
        hvnaToken = IERC20(_hvnaToken);
        nftContract = IERC721(_nftContract);
        owner = msg.sender;
        
        // Create default staking pools
        createPool("Basic Staking", 1000 * 10**18, 1000, 0, false); // 10% APR, no lock
        createPool("Premium Staking", 5000 * 10**18, 1500, 30 days, false); // 15% APR, 30-day lock
        createPool("NFT Holders Pool", 1000 * 10**18, 2000, 0, true); // 20% APR, requires NFT
        createPool("Diamond Hands", 10000 * 10**18, 2500, 90 days, false); // 25% APR, 90-day lock
    }
    
    // Create a new staking pool
    function createPool(
        string memory name,
        uint256 minStakeAmount,
        uint256 rewardRate,
        uint256 lockPeriod,
        bool requiresNFT
    ) public onlyOwner {
        poolCounter++;
        uint256 poolId = poolCounter;
        
        stakingPools[poolId] = StakingPool({
            id: poolId,
            name: name,
            minStakeAmount: minStakeAmount,
            rewardRate: rewardRate,
            lockPeriod: lockPeriod,
            requiresNFT: requiresNFT,
            isActive: true,
            totalStaked: 0,
            totalRewardsDistributed: 0
        });
        
        emit PoolCreated(poolId, name, rewardRate);
    }
    
    // Stake tokens in a pool
    function stake(uint256 poolId, uint256 amount) public notPaused {
        require(stakingPools[poolId].id != 0, "Pool does not exist");
        require(stakingPools[poolId].isActive, "Pool not active");
        require(amount >= stakingPools[poolId].minStakeAmount, "Amount below minimum");
        
        // Check NFT requirement
        if (stakingPools[poolId].requiresNFT) {
            require(nftContract.balanceOf(msg.sender) > 0, "NFT required");
        }
        
        // If user already has a stake in this pool, claim rewards first
        if (userStakes[msg.sender][poolId].isActive) {
            _claimRewards(poolId);
            userStakes[msg.sender][poolId].amount += amount;
        } else {
            // Create new stake
            userStakes[msg.sender][poolId] = Stake({
                poolId: poolId,
                amount: amount,
                timestamp: block.timestamp,
                lastClaimTimestamp: block.timestamp,
                totalClaimed: 0,
                isActive: true
            });
            
            userActivePools[msg.sender].push(poolId);
            poolStakers[poolId].push(msg.sender);
        }
        
        stakingPools[poolId].totalStaked += amount;
        
        // Transfer tokens to contract
        require(hvnaToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit Staked(msg.sender, poolId, amount);
    }
    
    // Unstake tokens from a pool
    function unstake(uint256 poolId, uint256 amount) public {
        Stake storage userStake = userStakes[msg.sender][poolId];
        require(userStake.isActive, "No active stake");
        require(userStake.amount >= amount, "Insufficient staked amount");
        
        // Check lock period
        StakingPool storage pool = stakingPools[poolId];
        require(
            block.timestamp >= userStake.timestamp + pool.lockPeriod,
            "Lock period not ended"
        );
        
        // Claim pending rewards first
        _claimRewards(poolId);
        
        // Update stake
        userStake.amount -= amount;
        pool.totalStaked -= amount;
        
        // If fully unstaked, mark as inactive
        if (userStake.amount == 0) {
            userStake.isActive = false;
            _removeFromActivePools(msg.sender, poolId);
        }
        
        // Transfer tokens back to user
        require(hvnaToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, poolId, amount);
    }
    
    // Claim rewards from a pool
    function claimRewards(uint256 poolId) public claimingEnabled {
        require(userStakes[msg.sender][poolId].isActive, "No active stake");
        _claimRewards(poolId);
    }
    
    // Internal function to claim rewards
    function _claimRewards(uint256 poolId) internal {
        Stake storage userStake = userStakes[msg.sender][poolId];
        uint256 rewards = calculateRewards(msg.sender, poolId);
        
        if (rewards > 0) {
            userStake.lastClaimTimestamp = block.timestamp;
            userStake.totalClaimed += rewards;
            stakingPools[poolId].totalRewardsDistributed += rewards;
            
            require(hvnaToken.transfer(msg.sender, rewards), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, poolId, rewards);
        }
    }
    
    // Calculate pending rewards
    function calculateRewards(address user, uint256 poolId) public view returns (uint256) {
        Stake storage userStake = userStakes[user][poolId];
        if (!userStake.isActive) return 0;
        
        StakingPool storage pool = stakingPools[poolId];
        uint256 timeElapsed = block.timestamp - userStake.lastClaimTimestamp;
        
        // Calculate annual reward
        uint256 annualReward = (userStake.amount * pool.rewardRate) / BASIS_POINTS;
        
        // Calculate reward for time elapsed
        uint256 reward = (annualReward * timeElapsed) / SECONDS_PER_YEAR;
        
        // Apply NFT bonus if user holds NFT
        if (nftContract.balanceOf(user) > 0) {
            reward = (reward * 11000) / BASIS_POINTS; // 10% bonus
        }
        
        return reward;
    }
    
    // Get all rewards for user across all pools
    function getTotalPendingRewards(address user) public view returns (uint256) {
        uint256 totalRewards = 0;
        uint256[] memory activePools = userActivePools[user];
        
        for (uint256 i = 0; i < activePools.length; i++) {
            totalRewards += calculateRewards(user, activePools[i]);
        }
        
        return totalRewards;
    }
    
    // Claim all rewards
    function claimAllRewards() public claimingEnabled {
        uint256[] memory activePools = userActivePools[msg.sender];
        
        for (uint256 i = 0; i < activePools.length; i++) {
            if (userStakes[msg.sender][activePools[i]].isActive) {
                _claimRewards(activePools[i]);
            }
        }
    }
    
    // Helper function to remove pool from user's active pools
    function _removeFromActivePools(address user, uint256 poolId) internal {
        uint256[] storage activePools = userActivePools[user];
        for (uint256 i = 0; i < activePools.length; i++) {
            if (activePools[i] == poolId) {
                activePools[i] = activePools[activePools.length - 1];
                activePools.pop();
                break;
            }
        }
    }
    
    // Admin functions
    function updatePool(
        uint256 poolId,
        uint256 newRewardRate,
        bool isActive
    ) public onlyOwner {
        require(stakingPools[poolId].id != 0, "Pool does not exist");
        
        stakingPools[poolId].rewardRate = newRewardRate;
        stakingPools[poolId].isActive = isActive;
        
        emit PoolUpdated(poolId, newRewardRate, isActive);
    }
    
    function toggleStaking() public onlyOwner {
        stakingPaused = !stakingPaused;
    }
    
    function toggleClaiming() public onlyOwner {
        claimingPaused = !claimingPaused;
    }
    
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = hvnaToken.balanceOf(address(this));
        require(hvnaToken.transfer(owner, balance), "Transfer failed");
    }
    
    // View functions
    function getUserActivePools(address user) public view returns (uint256[] memory) {
        return userActivePools[user];
    }
    
    function getPoolInfo(uint256 poolId) public view returns (
        string memory name,
        uint256 minStakeAmount,
        uint256 rewardRate,
        uint256 lockPeriod,
        bool requiresNFT,
        bool isActive,
        uint256 totalStaked
    ) {
        StakingPool storage pool = stakingPools[poolId];
        return (
            pool.name,
            pool.minStakeAmount,
            pool.rewardRate,
            pool.lockPeriod,
            pool.requiresNFT,
            pool.isActive,
            pool.totalStaked
        );
    }
    
    function getUserStakeInfo(address user, uint256 poolId) public view returns (
        uint256 amount,
        uint256 timestamp,
        uint256 totalClaimed,
        uint256 pendingRewards,
        bool isActive
    ) {
        Stake storage userStake = userStakes[user][poolId];
        return (
            userStake.amount,
            userStake.timestamp,
            userStake.totalClaimed,
            calculateRewards(user, poolId),
            userStake.isActive
        );
    }
}