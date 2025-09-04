const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 Genesis NFT Transfer System");
    console.log("=".repeat(40));
    
    // Contract details
    const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    const ownerPrivateKey = "291e79fdbc0f90e9483058041074be50d560087ca3b28e4bdbb596e5c25c36ce";
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log("Usage: node transferGenesis.js <tokenId> <buyerAddress> [priceETH]");
        console.log("Example: node transferGenesis.js 1 0x742d35Cc6670C0532925a3b8d5c3E2D0 2.5");
        process.exit(1);
    }
    
    const tokenId = parseInt(args[0]);
    const buyerAddress = args[1];
    const expectedPriceETH = args[2] ? parseFloat(args[2]) : 1.0;
    
    console.log("Token ID:", tokenId);
    console.log("Buyer:", buyerAddress);
    console.log("Expected Price:", expectedPriceETH, "ETH");
    
    if (tokenId < 1 || tokenId > 100) {
        console.error("❌ Invalid token ID. Must be 1-100 for Genesis NFTs");
        process.exit(1);
    }
    
    if (!ethers.isAddress(buyerAddress)) {
        console.error("❌ Invalid buyer address");
        process.exit(1);
    }
    
    try {
        // Connect to Base
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const owner = new ethers.Wallet(ownerPrivateKey, provider);
        
        console.log("\n📋 Pre-transfer Check:");
        console.log("Owner address:", owner.address);
        
        // Get contract instance
        const nftABI = [
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function transferFrom(address from, address to, uint256 tokenId)",
            "function approve(address to, uint256 tokenId)",
            "function safeTransferFrom(address from, address to, uint256 tokenId)"
        ];
        
        const nftContract = new ethers.Contract(NFT_CONTRACT, nftABI, owner);
        
        // Check current owner
        const currentOwner = await nftContract.ownerOf(tokenId);
        console.log("Current owner:", currentOwner);
        console.log("Is owner correct:", currentOwner.toLowerCase() === owner.address.toLowerCase());
        
        if (currentOwner.toLowerCase() !== owner.address.toLowerCase()) {
            console.error("❌ You don't own this NFT");
            process.exit(1);
        }
        
        // Check buyer's ETH balance
        const buyerBalance = await provider.getBalance(buyerAddress);
        const buyerETH = parseFloat(ethers.formatEther(buyerBalance));
        console.log("Buyer ETH balance:", buyerETH.toFixed(4));
        
        if (buyerETH < expectedPriceETH) {
            console.log("⚠️ Buyer has insufficient ETH balance");
            console.log("Required:", expectedPriceETH, "ETH");
            console.log("Available:", buyerETH.toFixed(4), "ETH");
        }
        
        // Get gas estimate
        const gasEstimate = await nftContract.transferFrom.estimateGas(
            owner.address, 
            buyerAddress, 
            tokenId
        );
        console.log("Estimated gas:", gasEstimate.toString());
        
        // Confirm transfer
        console.log("\n🔄 Executing Transfer...");
        console.log("From:", owner.address);
        console.log("To:", buyerAddress);
        console.log("Token ID:", tokenId);
        
        // Execute transfer
        const transferTx = await nftContract.transferFrom(
            owner.address,
            buyerAddress,
            tokenId,
            {
                gasLimit: gasEstimate + 50000n // Add buffer
            }
        );
        
        console.log("Transaction hash:", transferTx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await transferTx.wait();
        
        if (receipt.status === 1) {
            console.log("\n🎉 TRANSFER SUCCESSFUL!");
            console.log("=".repeat(40));
            console.log("✅ Genesis NFT #" + tokenId + " transferred");
            console.log("✅ New owner:", buyerAddress);
            console.log("✅ Transaction confirmed");
            console.log("✅ Gas used:", receipt.gasUsed.toString());
            
            console.log("\n🔗 View on BaseScan:");
            console.log(`https://basescan.org/tx/${transferTx.hash}`);
            
            // Verify new ownership
            const newOwner = await nftContract.ownerOf(tokenId);
            console.log("\n🔍 Verification:");
            console.log("New owner:", newOwner);
            console.log("Transfer confirmed:", newOwner.toLowerCase() === buyerAddress.toLowerCase());
            
        } else {
            console.log("❌ Transfer failed");
        }
        
    } catch (error) {
        console.error("❌ Transfer failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 Insufficient ETH for gas fees");
        } else if (error.message.includes("not owner")) {
            console.log("💡 Only the NFT owner can transfer");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});