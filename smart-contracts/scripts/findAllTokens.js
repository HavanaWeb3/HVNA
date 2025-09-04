const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Finding All Existing Token IDs");
    console.log("=".repeat(45));
    
    const fromAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    const toAddress = "0x4844382d686CE775e095315C084d40cEd16d8Cf5";
    const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        
        const nftABI = [
            "function ownerOf(uint256) view returns (address)",
            "function totalSupply() view returns (uint256)"
        ];
        
        const nftContract = new ethers.Contract(NFT_CONTRACT, nftABI, provider);
        
        const totalSupply = await nftContract.totalSupply();
        console.log("Total Supply:", totalSupply.toString());
        
        const existingTokens = [];
        const ownedByFrom = [];
        const ownedByTo = [];
        const ownedByOthers = [];
        
        console.log("\n🔍 Scanning for existing tokens (this may take a while)...");
        
        // Check tokens 1-200 to be sure (in case there are gaps)
        for (let tokenId = 1; tokenId <= 200; tokenId++) {
            try {
                const owner = await nftContract.ownerOf(tokenId);
                existingTokens.push(tokenId);
                
                if (owner.toLowerCase() === fromAddress.toLowerCase()) {
                    ownedByFrom.push(tokenId);
                } else if (owner.toLowerCase() === toAddress.toLowerCase()) {
                    ownedByTo.push(tokenId);
                } else {
                    ownedByOthers.push({ tokenId, owner });
                }
                
                if (tokenId % 50 === 0) {
                    console.log(`   Checked up to token ${tokenId}...`);
                }
                
            } catch (error) {
                // Token doesn't exist, skip
            }
        }
        
        console.log(`\n📋 DISCOVERY RESULTS:`);
        console.log(`✅ Found ${existingTokens.length} total tokens`);
        console.log(`📍 Token ID range: ${Math.min(...existingTokens)} - ${Math.max(...existingTokens)}`);
        
        console.log(`\n👥 OWNERSHIP BREAKDOWN:`);
        console.log(`🔴 Old wallet (${fromAddress.slice(0,8)}...): ${ownedByFrom.length} tokens`);
        console.log(`🟢 Secure wallet (${toAddress.slice(0,8)}...): ${ownedByTo.length} tokens`);
        console.log(`🔵 Other owners: ${ownedByOthers.length} tokens`);
        
        if (ownedByFrom.length > 0) {
            console.log(`\n🔴 Old Wallet Token IDs:`);
            const chunks = [];
            for (let i = 0; i < ownedByFrom.length; i += 20) {
                chunks.push(ownedByFrom.slice(i, i + 20));
            }
            chunks.forEach((chunk, i) => {
                console.log(`   Batch ${i+1}: ${chunk.join(', ')}`);
            });
        }
        
        if (ownedByTo.length > 0) {
            console.log(`\n🟢 Secure Wallet Token IDs:`);
            console.log(`   ${ownedByTo.join(', ')}`);
        }
        
        if (ownedByOthers.length > 0) {
            console.log(`\n🔵 Other Owners:`);
            ownedByOthers.forEach(item => {
                console.log(`   Token ${item.tokenId}: ${item.owner.slice(0,8)}...`);
            });
        }
        
        // Check for duplicates or unusual patterns
        const sortedTokens = [...existingTokens].sort((a, b) => a - b);
        const gaps = [];
        const duplicates = [];
        
        for (let i = 1; i < sortedTokens.length; i++) {
            const current = sortedTokens[i];
            const previous = sortedTokens[i-1];
            
            if (current === previous) {
                duplicates.push(current);
            } else if (current > previous + 1) {
                for (let gap = previous + 1; gap < current; gap++) {
                    gaps.push(gap);
                }
            }
        }
        
        console.log(`\n🔍 TOKEN ID ANALYSIS:`);
        console.log(`📊 All token IDs: ${sortedTokens.join(', ')}`);
        
        if (gaps.length > 0 && gaps.length < 20) {
            console.log(`❓ Missing IDs: ${gaps.join(', ')}`);
        } else if (gaps.length >= 20) {
            console.log(`❓ ${gaps.length} missing token IDs (large gaps detected)`);
        }
        
        if (duplicates.length > 0) {
            console.log(`⚠️  Duplicate IDs found: ${duplicates.join(', ')}`);
        }
        
        // Genesis range analysis
        const genesisRange = existingTokens.filter(id => id >= 1 && id <= 100);
        const nonGenesisTokens = existingTokens.filter(id => id < 1 || id > 100);
        
        console.log(`\n🎯 GENESIS ANALYSIS:`);
        console.log(`✅ Tokens in Genesis range (1-100): ${genesisRange.length}`);
        console.log(`❓ Tokens outside Genesis range: ${nonGenesisTokens.length}`);
        
        if (nonGenesisTokens.length > 0) {
            console.log(`   Non-Genesis tokens: ${nonGenesisTokens.join(', ')}`);
        }
        
        console.log(`\n💡 SUMMARY:`);
        if (existingTokens.length === 100 && genesisRange.length === 100) {
            console.log(`🎉 Perfect! Exactly 100 Genesis NFTs (1-100) exist`);
        } else if (existingTokens.length === 100) {
            console.log(`⚠️  100 total tokens exist, but not all in Genesis range`);
        } else {
            console.log(`⚠️  ${existingTokens.length} tokens exist (expected 100)`);
            if (existingTokens.length > 100) {
                console.log(`❓ Possible duplicates or extra minting occurred`);
            }
        }
        
    } catch (error) {
        console.error("❌ Scan failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});