const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying NFT Contract State");
    console.log("=".repeat(40));
    
    const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    const fromAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    const toAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        
        // Enhanced ABI to check contract state
        const nftABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function ownerOf(uint256) view returns (address)",
            "function tokenByIndex(uint256) view returns (uint256)",
            "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)"
        ];
        
        const nftContract = new ethers.Contract(NFT_CONTRACT, nftABI, provider);
        
        console.log("📋 Contract Basic Info:");
        const name = await nftContract.name();
        const symbol = await nftContract.symbol();
        const totalSupply = await nftContract.totalSupply();
        
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Total Supply:", totalSupply.toString());
        
        // Check balances
        const fromBalance = await nftContract.balanceOf(fromAddress);
        const toBalance = await nftContract.balanceOf(toAddress);
        
        console.log("\n💰 Address Balances:");
        console.log("From address NFTs:", fromBalance.toString());
        console.log("To address NFTs:", toBalance.toString());
        
        // Get actual token IDs owned by from address
        console.log("\n🔍 Token IDs owned by FROM address:");
        const fromTokens = [];
        try {
            const balance = parseInt(fromBalance.toString());
            for (let i = 0; i < Math.min(balance, 20); i++) { // Check first 20
                try {
                    const tokenId = await nftContract.tokenOfOwnerByIndex(fromAddress, i);
                    fromTokens.push(parseInt(tokenId.toString()));
                    console.log(`   Index ${i}: Token ID ${tokenId.toString()}`);
                } catch (error) {
                    console.log(`   Index ${i}: Error -`, error.message);
                }
            }
        } catch (error) {
            console.log("❌ Cannot enumerate tokens for from address");
            
            // Alternative: check tokens by iteration
            console.log("🔍 Checking tokens 1-20 by iteration:");
            for (let tokenId = 1; tokenId <= 20; tokenId++) {
                try {
                    const owner = await nftContract.ownerOf(tokenId);
                    if (owner.toLowerCase() === fromAddress.toLowerCase()) {
                        fromTokens.push(tokenId);
                        console.log(`   Token ${tokenId}: Owned by FROM`);
                    } else if (owner.toLowerCase() === toAddress.toLowerCase()) {
                        console.log(`   Token ${tokenId}: Owned by TO ✅`);
                    } else {
                        console.log(`   Token ${tokenId}: Owned by ${owner.slice(0,8)}...`);
                    }
                } catch (error) {
                    console.log(`   Token ${tokenId}: Not found`);
                }
            }
        }
        
        // Get actual token IDs owned by to address
        console.log("\n🔍 Token IDs owned by TO address:");
        const toTokens = [];
        try {
            const balance = parseInt(toBalance.toString());
            for (let i = 0; i < balance; i++) {
                try {
                    const tokenId = await nftContract.tokenOfOwnerByIndex(toAddress, i);
                    toTokens.push(parseInt(tokenId.toString()));
                    console.log(`   Index ${i}: Token ID ${tokenId.toString()} ✅`);
                } catch (error) {
                    console.log(`   Index ${i}: Error -`, error.message);
                }
            }
        } catch (error) {
            console.log("❌ Cannot enumerate tokens for to address");
        }
        
        // Check total supply vs expected
        const expectedSupply = 100; // Genesis NFTs
        const actualSupply = parseInt(totalSupply.toString());
        
        console.log("\n📊 Supply Analysis:");
        console.log("Expected Genesis NFTs:", expectedSupply);
        console.log("Actual total supply:", actualSupply);
        console.log("Supply matches:", actualSupply === expectedSupply ? "✅ YES" : "❌ NO");
        
        if (actualSupply !== expectedSupply) {
            console.log("⚠️ Supply mismatch detected!");
            if (actualSupply < expectedSupply) {
                console.log("   Possible issue: Not all NFTs were minted");
            } else {
                console.log("   Possible issue: More NFTs minted than expected");
            }
        }
        
        // Summary
        console.log("\n🎯 SUMMARY:");
        console.log("✅ Contract responding:", "YES");
        console.log("✅ Total NFTs minted:", actualSupply);
        console.log("✅ NFTs in FROM wallet:", fromBalance.toString());
        console.log("✅ NFTs in TO wallet:", toBalance.toString());
        
        if (fromTokens.length > 0) {
            console.log("\n🔄 Next Steps:");
            console.log("Need to transfer remaining NFTs:", fromTokens.slice(0, 10).join(', '));
        } else {
            console.log("\n🎉 All NFTs appear to be properly distributed!");
        }
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});