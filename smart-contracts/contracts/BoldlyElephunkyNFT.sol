// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract BoldlyElephunkyNFT {
    string public name = "Boldly Elephunky";
    string public symbol = "BELENFT";
    
    uint256 public totalSupply = 0;
    uint256 public maxSupply = 10000;
    uint256 public mintPrice = 0.01 ether;
    
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => string) public tokenURI;
    
    address public owner;
    string public baseTokenURI = "https://api.boldlyelephunky.com/metadata/";
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function mint(address to) public payable {
        require(totalSupply < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = totalSupply + 1;
        totalSupply++;
        
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        
        emit Transfer(address(0), to, tokenId);
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
    
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseTokenURI = newBaseURI;
    }
    
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}