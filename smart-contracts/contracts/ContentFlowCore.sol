// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ContentFlowCore {
    IERC20 public hvnaToken;
    address public owner;
    address public treasuryContract;
    
    // Creator profiles
    struct Creator {
        address wallet;
        string username;
        string profileHash; // IPFS hash
        uint256 totalEarnings;
        uint256 contentCount;
        uint256 followerCount;
        bool isVerified;
        uint256 joinedTimestamp;
    }
    
    // Content posts
    struct Content {
        uint256 id;
        address creator;
        string contentHash; // IPFS hash
        string title;
        uint256 timestamp;
        uint256 likes;
        uint256 shares;
        uint256 comments;
        uint256 views;
        uint256 earnings;
        ContentType contentType;
        bool isNFT;
        uint256 nftPrice;
    }
    
    enum ContentType {
        TEXT,
        IMAGE,
        VIDEO,
        AUDIO,
        MIXED
    }
    
    // Engagement tracking
    struct Engagement {
        address user;
        uint256 contentId;
        EngagementType engagementType;
        uint256 timestamp;
        uint256 reward;
    }
    
    enum EngagementType {
        LIKE,
        SHARE,
        COMMENT,
        VIEW
    }
    
    // Reward rates (in HVNA tokens per engagement)
    mapping(EngagementType => uint256) public baseRewards;
    mapping(ContentType => uint256) public contentMultipliers;
    
    // Storage
    mapping(address => Creator) public creators;
    mapping(uint256 => Content) public content;
    mapping(bytes32 => bool) public hasEngaged; // user+content+type hash
    mapping(address => uint256[]) public creatorContent;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public contentCounter = 0;
    uint256 public totalRewardsPaid = 0;
    uint256 public platformFeeRate = 500; // 5% = 500 basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    // Quality scoring system
    mapping(uint256 => uint256) public qualityScores; // contentId => score (0-100)
    mapping(address => bool) public qualityModerators;
    
    event CreatorRegistered(address indexed creator, string username);
    event ContentCreated(uint256 indexed contentId, address indexed creator, ContentType contentType);
    event EngagementRecorded(uint256 indexed contentId, address indexed user, EngagementType engagementType);
    event RewardsPaid(address indexed creator, uint256 amount);
    event QualityScoreAssigned(uint256 indexed contentId, uint256 score);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier onlyModerator() {
        require(qualityModerators[msg.sender] || msg.sender == owner, "Not a moderator");
        _;
    }
    
    modifier creatorExists(address _creator) {
        require(creators[_creator].wallet != address(0), "Creator not registered");
        _;
    }
    
    constructor(address _hvnaToken) {
        hvnaToken = IERC20(_hvnaToken);
        owner = msg.sender;
        
        // Initialize base reward rates (in wei, 18 decimals)
        baseRewards[EngagementType.VIEW] = 1 * 10**15;    // 0.001 HVNA per view
        baseRewards[EngagementType.LIKE] = 5 * 10**15;    // 0.005 HVNA per like
        baseRewards[EngagementType.COMMENT] = 10 * 10**15; // 0.01 HVNA per comment
        baseRewards[EngagementType.SHARE] = 20 * 10**15;   // 0.02 HVNA per share
        
        // Content type multipliers (basis points)
        contentMultipliers[ContentType.TEXT] = 10000;     // 1x
        contentMultipliers[ContentType.IMAGE] = 12000;    // 1.2x
        contentMultipliers[ContentType.AUDIO] = 15000;    // 1.5x
        contentMultipliers[ContentType.VIDEO] = 18000;    // 1.8x
        contentMultipliers[ContentType.MIXED] = 20000;    // 2x
    }
    
    // Register as creator
    function registerCreator(string memory username, string memory profileHash) public {
        require(creators[msg.sender].wallet == address(0), "Already registered");
        require(bytes(username).length > 0, "Username required");
        
        creators[msg.sender] = Creator({
            wallet: msg.sender,
            username: username,
            profileHash: profileHash,
            totalEarnings: 0,
            contentCount: 0,
            followerCount: 0,
            isVerified: false,
            joinedTimestamp: block.timestamp
        });
        
        emit CreatorRegistered(msg.sender, username);
    }
    
    // Create content
    function createContent(
        string memory contentHash,
        string memory title,
        ContentType contentType,
        bool isNFT,
        uint256 nftPrice
    ) public creatorExists(msg.sender) {
        require(bytes(contentHash).length > 0, "Content hash required");
        
        contentCounter++;
        uint256 contentId = contentCounter;
        
        content[contentId] = Content({
            id: contentId,
            creator: msg.sender,
            contentHash: contentHash,
            title: title,
            timestamp: block.timestamp,
            likes: 0,
            shares: 0,
            comments: 0,
            views: 0,
            earnings: 0,
            contentType: contentType,
            isNFT: isNFT,
            nftPrice: nftPrice
        });
        
        creatorContent[msg.sender].push(contentId);
        creators[msg.sender].contentCount++;
        
        emit ContentCreated(contentId, msg.sender, contentType);
    }
    
    // Engage with content (like, share, comment, view)
    function engage(uint256 contentId, EngagementType engagementType) public {
        require(content[contentId].id != 0, "Content does not exist");
        
        bytes32 engagementHash = keccak256(abi.encodePacked(msg.sender, contentId, engagementType));
        require(!hasEngaged[engagementHash], "Already engaged");
        
        // Record engagement
        hasEngaged[engagementHash] = true;
        
        // Update content stats
        if (engagementType == EngagementType.LIKE) {
            content[contentId].likes++;
        } else if (engagementType == EngagementType.SHARE) {
            content[contentId].shares++;
        } else if (engagementType == EngagementType.COMMENT) {
            content[contentId].comments++;
        } else if (engagementType == EngagementType.VIEW) {
            content[contentId].views++;
        }
        
        // Calculate reward
        uint256 baseReward = baseRewards[engagementType];
        uint256 contentMultiplier = contentMultipliers[content[contentId].contentType];
        uint256 qualityMultiplier = getQualityMultiplier(contentId);
        
        uint256 totalReward = (baseReward * contentMultiplier * qualityMultiplier) / (BASIS_POINTS * 100);
        
        // Add to creator's pending rewards
        address creator = content[contentId].creator;
        pendingRewards[creator] += totalReward;
        content[contentId].earnings += totalReward;
        
        emit EngagementRecorded(contentId, msg.sender, engagementType);
    }
    
    // Claim pending rewards
    function claimRewards() public creatorExists(msg.sender) {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        // Calculate platform fee
        uint256 fee = (amount * platformFeeRate) / BASIS_POINTS;
        uint256 creatorAmount = amount - fee;
        
        // Reset pending rewards
        pendingRewards[msg.sender] = 0;
        
        // Update creator stats
        creators[msg.sender].totalEarnings += creatorAmount;
        totalRewardsPaid += amount;
        
        // Transfer tokens
        require(hvnaToken.transfer(msg.sender, creatorAmount), "Transfer failed");
        
        // Send fee to treasury if set
        if (treasuryContract != address(0) && fee > 0) {
            require(hvnaToken.transfer(treasuryContract, fee), "Fee transfer failed");
        }
        
        emit RewardsPaid(msg.sender, creatorAmount);
    }
    
    // Quality scoring by moderators
    function assignQualityScore(uint256 contentId, uint256 score) public onlyModerator {
        require(content[contentId].id != 0, "Content does not exist");
        require(score <= 100, "Score must be 0-100");
        
        qualityScores[contentId] = score;
        emit QualityScoreAssigned(contentId, score);
    }
    
    // Get quality multiplier (50-200% based on score)
    function getQualityMultiplier(uint256 contentId) public view returns (uint256) {
        uint256 score = qualityScores[contentId];
        if (score == 0) return 100; // Default 100% if not scored
        
        // Score 0-50: 50-100% multiplier
        // Score 50-100: 100-200% multiplier
        if (score <= 50) {
            return 50 + score;
        } else {
            return 100 + ((score - 50) * 2);
        }
    }
    
    // Admin functions
    function addModerator(address moderator) public onlyOwner {
        qualityModerators[moderator] = true;
    }
    
    function removeModerator(address moderator) public onlyOwner {
        qualityModerators[moderator] = false;
    }
    
    function verifyCreator(address creator) public onlyOwner {
        require(creators[creator].wallet != address(0), "Creator not registered");
        creators[creator].isVerified = true;
    }
    
    function updateRewardRate(EngagementType engagementType, uint256 newRate) public onlyOwner {
        baseRewards[engagementType] = newRate;
    }
    
    function updateContentMultiplier(ContentType contentType, uint256 multiplier) public onlyOwner {
        contentMultipliers[contentType] = multiplier;
    }
    
    function setTreasuryContract(address _treasury) public onlyOwner {
        treasuryContract = _treasury;
    }
    
    function setPlatformFee(uint256 newFeeRate) public onlyOwner {
        require(newFeeRate <= 1000, "Fee too high"); // Max 10%
        platformFeeRate = newFeeRate;
    }
    
    // View functions
    function getCreatorContent(address creator) public view returns (uint256[] memory) {
        return creatorContent[creator];
    }
    
    function getContentStats(uint256 contentId) public view returns (
        uint256 likes,
        uint256 shares,
        uint256 comments,
        uint256 views,
        uint256 earnings
    ) {
        Content storage c = content[contentId];
        return (c.likes, c.shares, c.comments, c.views, c.earnings);
    }
    
    function getPendingRewards(address creator) public view returns (uint256) {
        return pendingRewards[creator];
    }
    
    // Emergency functions
    function emergencyWithdraw() public onlyOwner {
        uint256 balance = hvnaToken.balanceOf(address(this));
        require(hvnaToken.transfer(owner, balance), "Transfer failed");
    }
}