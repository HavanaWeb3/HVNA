const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Genesis NFT Transfer Status");
    console.log("=".repeat(45));
    
    const fromAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    const toAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5";
    const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        
        const nftABI = [
            "function ownerOf(uint256) view returns (address)",
            "function balanceOf(address) view returns (uint256)"
        ];
        
        const nftContract = new ethers.Contract(NFT_CONTRACT, nftABI, provider);
        
        // Check balances
        const fromBalance = await nftContract.balanceOf(fromAddress);
        const toBalance = await nftContract.balanceOf(toAddress);
        
        console.log("📊 Current NFT Balances:");
        console.log("From address (old):", fromBalance.toString(), "NFTs");
        console.log("To address (secure):", toBalance.toString(), "NFTs");
        
        // Check specific Genesis NFTs (1-100)
        const ownedByFrom = [];
        const ownedByTo = [];
        const notFound = [];
        
        console.log("\n🔍 Checking Genesis NFT ownership (1-100):");
        
        for (let tokenId = 1; tokenId <= 100; tokenId++) {
            try {
                const owner = await nftContract.ownerOf(tokenId);
                
                if (owner.toLowerCase() === fromAddress.toLowerCase()) {
                    ownedByFrom.push(tokenId);
                } else if (owner.toLowerCase() === toAddress.toLowerCase()) {
                    ownedByTo.push(tokenId);
                }
                
                // Show progress every 20 checks
                if (tokenId % 20 === 0) {
                    console.log(`   Checked ${tokenId}/100...`);
                }
                
            } catch (error) {
                notFound.push(tokenId);
            }
        }
        
        console.log("\n📋 Genesis NFT Status:");
        console.log("✅ In secure wallet:", ownedByTo.length);
        console.log("⏳ Still in old wallet:", ownedByFrom.length);
        console.log("❓ Not found/error:", notFound.length);
        
        if (ownedByTo.length > 0) {
            console.log("\n✅ Successfully Transferred to Secure Wallet:");
            console.log("   Genesis NFTs:", ownedByTo.slice(0, 20).join(', ') + (ownedByTo.length > 20 ? '...' : ''));
        }
        
        if (ownedByFrom.length > 0) {
            console.log("\n⏳ Still Need to Transfer:");
            console.log("   Genesis NFTs:", ownedByFrom.slice(0, 20).join(', ') + (ownedByFrom.length > 20 ? '...' : ''));
            console.log("   Total remaining:", ownedByFrom.length);
        }
        
        if (notFound.length > 0) {
            console.log("\n❓ Not Found (may not exist):");
            console.log("   IDs:", notFound.slice(0, 10).join(', ') + (notFound.length > 10 ? '...' : ''));
        }
        
        // Summary
        console.log("\n🎯 SUMMARY:");
        console.log(`✅ ${ownedByTo.length}/100 Genesis NFTs in your secure wallet`);
        console.log(`⏳ ${ownedByFrom.length}/100 Genesis NFTs still need transfer`);
        
        if (ownedByFrom.length === 0) {
            console.log("🎉 ALL GENESIS NFTs SUCCESSFULLY TRANSFERRED!");
            console.log("✅ Ready to update purchase system");
        } else {
            console.log("🔄 Need to complete remaining transfers");
        }
        
        // Check ETH balances too
        console.log("\n💰 ETH Balances:");
        const fromETH = await provider.getBalance(fromAddress);
        const toETH = await provider.getBalance(toAddress);
        
        console.log("From address:", ethers.formatEther(fromETH), "ETH");
        console.log("To address:", ethers.formatEther(toETH), "ETH");
        
    } catch (error) {
        console.error("❌ Check failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});