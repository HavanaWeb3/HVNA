const { ethers } = require("hardhat");

async function main() {
  console.log("=== CHECKING NFTS IN COMPROMISED WALLET ===");
  
  const compromisedWallet = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
  const genesisContract = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  
  // Contract ABI for balanceOf and tokenOfOwnerByIndex
  const contractABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)"
  ];
  
  try {
    // Use Base network provider
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const contract = new ethers.Contract(genesisContract, contractABI, provider);
    
    // Check how many NFTs the wallet owns
    const balance = await contract.balanceOf(compromisedWallet);
    console.log(`Compromised wallet owns ${balance.toString()} Genesis NFTs`);
    
    if (balance > 0) {
      console.log("\nToken IDs owned by compromised wallet:");
      const tokenIds = [];
      
      // Get all token IDs owned by the wallet
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(compromisedWallet, i);
          tokenIds.push(tokenId.toString());
          console.log(`Index ${i}: Token ID ${tokenId.toString()}`);
        } catch (error) {
          console.log(`Error getting token at index ${i}:`, error.message);
        }
      }
      
      console.log(`\nToken IDs to rescue: [${tokenIds.join(', ')}]`);
      console.log(`Total NFTs to rescue: ${tokenIds.length}`);
      
      return tokenIds;
    } else {
      console.log("No NFTs found in compromised wallet");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    
    // Fallback: manually check token IDs 1-100
    console.log("\nFallback: Checking individual token ownership...");
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const contract = new ethers.Contract(genesisContract, contractABI, provider);
    
    const ownedTokens = [];
    for (let tokenId = 1; tokenId <= 100; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() === compromisedWallet.toLowerCase()) {
          ownedTokens.push(tokenId);
          console.log(`Token ${tokenId}: OWNED by compromised wallet`);
        }
      } catch (error) {
        // Token doesn't exist or error
      }
    }
    
    console.log(`\nFound ${ownedTokens.length} NFTs: [${ownedTokens.join(', ')}]`);
    return ownedTokens;
  }
}

main()
  .then((result) => {
    if (result && result.length > 0) {
      console.log(`\n🎯 RESCUE TARGET: ${result.length} NFTs`);
      console.log(`📋 TOKEN IDs: [${result.join(', ')}]`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });