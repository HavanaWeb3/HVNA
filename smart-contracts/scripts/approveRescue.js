const { ethers } = require("hardhat");

async function main() {
  console.log("=== APPROVE RESCUE CONTRACT ===");
  
  // Configuration
  const genesisContract = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  const rescuerAddress = "0x770008bd750c230000D7f581a454c8eE437ab7F8"; // Our deployed rescue contract
  
  const [signer] = await ethers.getSigners();
  console.log("Approving from wallet:", signer.address);
  
  // Connect to Genesis NFT contract
  const genesisNFT = await ethers.getContractAt("@openzeppelin/contracts/token/ERC721/IERC721.sol:IERC721", genesisContract);
  
  console.log("🔐 Setting approval for all NFTs...");
  console.log(`Rescue contract: ${rescuerAddress}`);
  
  try {
    // Approve the rescue contract to transfer all NFTs
    const tx = await genesisNFT.setApprovalForAll(rescuerAddress, true);
    
    console.log("📤 Approval transaction submitted:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ APPROVAL SUCCESSFUL!");
      console.log("🚀 Now run the rescue script immediately from your secure wallet!");
      console.log("Command: npx hardhat run scripts/executeRescue.js --network base");
      console.log("🔗 Transaction:", `https://basescan.org/tx/${tx.hash}`);
    } else {
      console.log("❌ Approval failed");
    }
    
  } catch (error) {
    console.error("❌ Approval failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });