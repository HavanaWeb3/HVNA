// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract BoldlyElephunkyNFTEnhanced {
    string public name = "Boldly Elephunky";
    string public symbol = "BELENFT";
    
    uint256 public totalSupply = 0;
    uint256 public maxSupply = 10000;
    uint256 public genesisSupply = 100;  // First 100 are Genesis
    uint256 public mintPrice = 0.01 ether;
    uint256 public genesisPriceMin = 1 ether;   // $1000 minimum
    uint256 public genesisPriceMax = 2.5 ether; // $2500 maximum
    
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => string) public tokenURI;
    
    // Genesis tracking
    mapping(uint256 => uint256) public genesisPrice; // tokenId => price paid
    uint256 public genesisCount = 0;
    
    address public owner;
    string public baseTokenURI = "https://api.boldlyelephunky.com/metadata/";
    string public genesisBaseURI = "https://api.boldlyelephunky.com/genesis/";
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event GenesisMint(address indexed to, uint256 indexed tokenId, uint256 price);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Check if a token ID is Genesis (1-100)
    function isGenesis(uint256 tokenId) public pure returns (bool) {
        return tokenId >= 1 && tokenId <= 100;
    }
    
    // Check if an address owns any Genesis NFTs
    function hasGenesisNFT(address account) public view returns (bool) {
        for (uint256 i = 1; i <= genesisCount && i <= 100; i++) {
            if (ownerOf[i] == account) {
                return true;
            }
        }
        return false;
    }
    
    // Count Genesis NFTs owned by address
    function genesisBalanceOf(address account) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= genesisCount && i <= 100; i++) {
            if (ownerOf[i] == account) {
                count++;
            }
        }
        return count;
    }
    
    // Get tier based on NFT holdings
    function getTier(address account) public view returns (string memory, uint256) {
        uint256 genesis = genesisBalanceOf(account);
        uint256 regular = balanceOf[account] - genesis;
        
        if (genesis > 0) {
            return ("Genesis", 30); // 30% discount for any Genesis holder
        } else if (regular >= 3) {
            return ("Platinum", 30); // 30% discount for 3+ regular NFTs
        } else if (regular >= 2) {
            return ("Gold", 20); // 20% discount for 2 regular NFTs
        } else if (regular >= 1) {
            return ("Silver", 10); // 10% discount for 1 regular NFT
        } else {
            return ("None", 0); // No discount
        }
    }
    
    // Mint Genesis NFT (tokens 1-100) - variable pricing
    function mintGenesis(address to) public payable {
        require(genesisCount < genesisSupply, "All Genesis NFTs minted");
        require(msg.value >= genesisPriceMin, "Insufficient payment for Genesis");
        require(msg.value <= genesisPriceMax, "Exceeds maximum Genesis price");
        
        genesisCount++;
        uint256 tokenId = genesisCount; // Genesis tokens are 1-100
        totalSupply++;
        
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        genesisPrice[tokenId] = msg.value;
        
        emit Transfer(address(0), to, tokenId);
        emit GenesisMint(to, tokenId, msg.value);
    }
    
    // Mint regular NFT (tokens 101-10000)
    function mint(address to) public payable {
        require(totalSupply < maxSupply, "Max supply reached");
        require(genesisCount >= genesisSupply, "Genesis phase not complete");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = genesisSupply + (totalSupply - genesisCount); // Start from 101
        totalSupply++;
        
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    // Owner can mint remaining Genesis NFTs for marketing/team
    function ownerMintGenesis(address to, uint256 amount) public onlyOwner {
        require(genesisCount + amount <= genesisSupply, "Exceeds Genesis supply");
        
        for (uint256 i = 0; i < amount; i++) {
            genesisCount++;
            uint256 tokenId = genesisCount;
            totalSupply++;
            
            ownerOf[tokenId] = to;
            balanceOf[to]++;
            genesisPrice[tokenId] = 0; // Owner mints at 0 cost
            
            emit Transfer(address(0), to, tokenId);
            emit GenesisMint(to, tokenId, 0);
        }
    }
    
    function approve(address to, uint256 tokenId) public {
        require(ownerOf[tokenId] == msg.sender || isApprovedForAll[ownerOf[tokenId]][msg.sender], "Not authorized");
        getApproved[tokenId] = to;
        emit Approval(ownerOf[tokenId], to, tokenId);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf[tokenId] == from, "Not owner");
        require(msg.sender == from || getApproved[tokenId] == msg.sender || isApprovedForAll[from][msg.sender], "Not authorized");
        
        ownerOf[tokenId] = to;
        balanceOf[from]--;
        balanceOf[to]++;
        getApproved[tokenId] = address(0);
        
        emit Transfer(from, to, tokenId);
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }
    
    function setGenesisPricing(uint256 minPrice, uint256 maxPrice) public onlyOwner {
        genesisPriceMin = minPrice;
        genesisPriceMax = maxPrice;
    }
    
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseTokenURI = newBaseURI;
    }
    
    function setGenesisURI(string memory newGenesisURI) public onlyOwner {
        genesisBaseURI = newGenesisURI;
    }
    
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // Enhanced tokenURI with Genesis support
    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        
        if (isGenesis(tokenId)) {
            return string(abi.encodePacked(genesisBaseURI, uint2str(tokenId), ".json"));
        } else {
            return string(abi.encodePacked(baseTokenURI, uint2str(tokenId), ".json"));
        }
    }
    
    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}