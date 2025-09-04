const { ethers } = require("hardhat");

async function main() {
    console.log("🔗 Updating Contract Base URI");
    console.log("=".repeat(40));
    
    const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    const ownerPrivateKey = "291e79fdbc0f90e9483058041074be50d560087ca3b28e4bdbb596e5c25c36ce"; // Temp key
    const newBaseURI = "http://localhost:3001/genesis/";
    
    console.log("Contract:", NFT_CONTRACT);
    console.log("New Base URI:", newBaseURI);
    
    try {
        // Connect to Base
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
        
        // Contract ABI for setBaseURI
        const nftABI = [
            "function setBaseURI(string memory baseURI)",
            "function tokenURI(uint256) view returns (string)",
            "function owner() view returns (address)"
        ];
        
        const nftContract = new ethers.Contract(NFT_CONTRACT, nftABI, ownerWallet);
        
        // Check current owner
        const currentOwner = await nftContract.owner();
        console.log("Contract owner:", currentOwner);
        console.log("Wallet address:", ownerWallet.address);
        
        if (currentOwner.toLowerCase() !== ownerWallet.address.toLowerCase()) {
            console.log("❌ Wallet is not the contract owner");
            console.log("❌ Cannot update baseURI");
            return;
        }
        
        // Update base URI
        console.log("\n🔄 Updating base URI...");
        const updateTx = await nftContract.setBaseURI(newBaseURI, {
            gasLimit: 100000
        });
        
        console.log("Transaction hash:", updateTx.hash);
        
        const receipt = await updateTx.wait();
        
        if (receipt.status === 1) {
            console.log("✅ Base URI updated successfully!");
            
            // Test the new URI
            console.log("\n🧪 Testing new URI:");
            try {
                const tokenURI1 = await nftContract.tokenURI(1);
                const tokenURI50 = await nftContract.tokenURI(50);
                
                console.log("Token 1 URI:", tokenURI1);
                console.log("Token 50 URI:", tokenURI50);
                
                console.log("\n✅ NFTs will now show metadata from local server");
                console.log("✅ OpenSea will refresh metadata automatically");
                
            } catch (error) {
                console.log("⚠️ Could not test URIs:", error.message);
            }
        } else {
            console.log("❌ Transaction failed");
        }
        
    } catch (error) {
        console.error("❌ Update failed:", error.message);
        
        if (error.message.includes("revert")) {
            console.log("💡 Possible causes:");
            console.log("   - Contract may not have setBaseURI function");
            console.log("   - Wallet may not be the owner");
            console.log("   - Contract may be paused");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});