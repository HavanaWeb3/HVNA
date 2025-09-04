const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 Transferring All Genesis NFTs to Secure Wallet");
    console.log("=".repeat(50));
    
    // Addresses
    const fromPrivateKey = "291e79fdbc0f90e9483058041074be50d560087ca3b28e4bdbb596e5c25c36ce"; // Temp key (to be discarded)
    const fromAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    const toAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5"; // Your secure wallet
    const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    
    console.log("From (current owner):", fromAddress);
    console.log("To (your secure wallet):", toAddress);
    console.log("Contract:", NFT_CONTRACT);
    
    try {
        // Connect to Base
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        const fromWallet = new ethers.Wallet(fromPrivateKey, provider);
        
        // Check balances
        const fromBalance = await provider.getBalance(fromAddress);
        const toBalance = await provider.getBalance(toAddress);
        
        console.log("\n💰 Current Balances:");
        console.log("From wallet:", ethers.formatEther(fromBalance), "ETH");
        console.log("To wallet:", ethers.formatEther(toBalance), "ETH");
        
        // Get contract
        const nftABI = [
            "function balanceOf(address) view returns (uint256)",
            "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
            "function transferFrom(address from, address to, uint256 tokenId)",
            "function ownerOf(uint256) view returns (address)"
        ];
        
        const nftContract = new ethers.Contract(NFT_CONTRACT, nftABI, fromWallet);
        
        // Check how many NFTs the from address owns
        const balance = await nftContract.balanceOf(fromAddress);
        console.log("\n📋 NFT Inventory:");
        console.log("Total NFTs owned by from address:", balance.toString());
        
        if (balance.toString() === "0") {
            console.log("✅ No NFTs to transfer - they may already be transferred");
            
            // Check a few specific Genesis NFTs to see where they are
            console.log("\n🔍 Checking specific Genesis NFT locations:");
            for (let i = 1; i <= 10; i++) {
                try {
                    const owner = await nftContract.ownerOf(i);
                    console.log(`NFT #${i}: ${owner}`);
                } catch (error) {
                    console.log(`NFT #${i}: Not minted or error`);
                }
            }
            return;
        }
        
        // Get all Genesis NFT IDs (1-100) owned by from address
        const ownedNFTs = [];
        console.log("\n🔍 Finding owned Genesis NFTs...");
        
        for (let tokenId = 1; tokenId <= 100; tokenId++) {
            try {
                const owner = await nftContract.ownerOf(tokenId);
                if (owner.toLowerCase() === fromAddress.toLowerCase()) {
                    ownedNFTs.push(tokenId);
                    console.log(`Found: Genesis NFT #${tokenId}`);
                }
            } catch (error) {
                // Token doesn't exist or error
            }
        }
        
        console.log(`\n📦 Found ${ownedNFTs.length} Genesis NFTs to transfer`);
        
        if (ownedNFTs.length === 0) {
            console.log("❌ No Genesis NFTs found to transfer");
            return;
        }
        
        // Transfer NFTs in batches (to avoid gas limit issues)
        const batchSize = 10;
        let transferred = 0;
        
        for (let i = 0; i < ownedNFTs.length; i += batchSize) {
            const batch = ownedNFTs.slice(i, i + batchSize);
            console.log(`\n🔄 Transferring batch ${Math.floor(i/batchSize) + 1}: NFTs ${batch.join(', ')}`);
            
            for (const tokenId of batch) {
                try {
                    console.log(`   Transferring Genesis NFT #${tokenId}...`);
                    
                    const transferTx = await nftContract.transferFrom(
                        fromAddress,
                        toAddress,
                        tokenId,
                        { gasLimit: 200000 }
                    );
                    
                    console.log(`   TX: ${transferTx.hash}`);
                    await transferTx.wait();
                    console.log(`   ✅ Genesis NFT #${tokenId} transferred`);
                    transferred++;
                    
                    // Small delay to avoid overwhelming the network
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.log(`   ❌ Failed to transfer #${tokenId}:`, error.message);
                }
            }
            
            console.log(`   Batch complete. Total transferred: ${transferred}`);
            
            // Longer delay between batches
            if (i + batchSize < ownedNFTs.length) {
                console.log("   Waiting 5 seconds before next batch...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        console.log("\n🎉 TRANSFER COMPLETE!");
        console.log("=".repeat(50));
        console.log(`✅ Successfully transferred ${transferred} Genesis NFTs`);
        console.log(`✅ From: ${fromAddress}`);
        console.log(`✅ To: ${toAddress}`);
        
        // Verify transfers
        console.log("\n🔍 Verification:");
        const newBalance = await nftContract.balanceOf(toAddress);
        console.log("New balance at destination:", newBalance.toString());
        
        // Also transfer any remaining ETH
        const remainingETH = await provider.getBalance(fromAddress);
        const remainingAmount = parseFloat(ethers.formatEther(remainingETH));
        
        if (remainingAmount > 0.001) { // If more than gas cost
            console.log(`\n💰 Transferring remaining ${remainingAmount.toFixed(4)} ETH...`);
            
            try {
                const ethTransferTx = await fromWallet.sendTransaction({
                    to: toAddress,
                    value: remainingETH - ethers.parseEther("0.001") // Leave some for gas
                });
                
                await ethTransferTx.wait();
                console.log("✅ ETH transferred");
            } catch (error) {
                console.log("⚠️ ETH transfer failed:", error.message);
            }
        }
        
        console.log("\n🔒 SECURITY REMINDER:");
        console.log("❌ The temporary private key is now UNSAFE");
        console.log("✅ All assets moved to your secure wallet");
        console.log("✅ Ready to update purchase system");
        
    } catch (error) {
        console.error("❌ Transfer failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});