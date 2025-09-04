// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract Governance {
    IERC20 public hvnaToken;
    address public owner;
    
    uint256 public proposalCounter = 0;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_TOKENS_TO_PROPOSE = 1000 * 10**18; // 1,000 HVNA
    uint256 public constant MIN_TOKENS_TO_VOTE = 100 * 10**18;    // 100 HVNA
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(uint256 => uint256) votes; // option => vote count
        mapping(address => bool) hasVoted;
        uint256 totalVotes;
        ProposalType proposalType;
    }
    
    enum ProposalType {
        PRODUCT_DESIGN,
        TOKENOMICS,
        MARKETING,
        CONTENTFLOW_FEATURE,
        TREASURY_ALLOCATION
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 option,
        uint256 weight
    );
    
    event ProposalExecuted(uint256 indexed proposalId, uint256 winningOption);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    modifier canPropose() {
        require(hvnaToken.balanceOf(msg.sender) >= MIN_TOKENS_TO_PROPOSE, "Insufficient tokens to propose");
        _;
    }
    
    modifier canVote() {
        require(hvnaToken.balanceOf(msg.sender) >= MIN_TOKENS_TO_VOTE, "Insufficient tokens to vote");
        _;
    }
    
    constructor(address _hvnaToken) {
        hvnaToken = IERC20(_hvnaToken);
        owner = msg.sender;
    }
    
    // Create a new proposal
    function createProposal(
        string memory title,
        string memory description,
        string[] memory options,
        ProposalType proposalType
    ) public canPropose returns (uint256) {
        require(options.length >= 2 && options.length <= 10, "Invalid number of options");
        require(bytes(title).length > 0, "Title cannot be empty");
        
        proposalCounter++;
        uint256 proposalId = proposalCounter;
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.options = options;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_PERIOD;
        newProposal.executed = false;
        newProposal.proposalType = proposalType;
        
        emit ProposalCreated(proposalId, msg.sender, title, proposalType);
        return proposalId;
    }
    
    // Vote on a proposal
    function vote(uint256 proposalId, uint256 optionIndex) public canVote {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(optionIndex < proposal.options.length, "Invalid option");
        
        // Voting power based on token balance (1 token = 1 vote)
        uint256 voterBalance = hvnaToken.balanceOf(msg.sender);
        
        proposal.votes[optionIndex] += voterBalance;
        proposal.hasVoted[msg.sender] = true;
        proposal.totalVotes += voterBalance;
        
        emit VoteCast(proposalId, msg.sender, optionIndex, voterBalance);
    }
    
    // Execute proposal (determine winner)
    function executeProposal(uint256 proposalId) public returns (uint256 winningOption) {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        
        // Find winning option
        uint256 highestVotes = 0;
        uint256 winner = 0;
        
        for (uint256 i = 0; i < proposal.options.length; i++) {
            if (proposal.votes[i] > highestVotes) {
                highestVotes = proposal.votes[i];
                winner = i;
            }
        }
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId, winner);
        return winner;
    }
    
    // Get proposal details
    function getProposal(uint256 proposalId) public view returns (
        address proposer,
        string memory title,
        string memory description,
        string[] memory options,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        uint256 totalVotes,
        ProposalType proposalType
    ) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        
        return (
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.options,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.totalVotes,
            proposal.proposalType
        );
    }
    
    // Get votes for a specific option
    function getVotes(uint256 proposalId, uint256 optionIndex) public view returns (uint256) {
        return proposals[proposalId].votes[optionIndex];
    }
    
    // Check if user has voted
    function hasVoted(uint256 proposalId, address voter) public view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    // Get all votes for a proposal
    function getAllVotes(uint256 proposalId) public view returns (uint256[] memory) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        
        uint256[] memory allVotes = new uint256[](proposal.options.length);
        for (uint256 i = 0; i < proposal.options.length; i++) {
            allVotes[i] = proposal.votes[i];
        }
        return allVotes;
    }
    
    // Emergency functions
    function updateMinTokensToPropose(uint256 newAmount) public onlyOwner {
        // Implementation would update MIN_TOKENS_TO_PROPOSE
    }
    
    function updateVotingPeriod(uint256 newPeriod) public onlyOwner {
        // Implementation would update VOTING_PERIOD
    }
}