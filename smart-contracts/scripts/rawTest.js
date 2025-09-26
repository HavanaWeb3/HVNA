require('dotenv').config();
const { ethers } = require('ethers');

async function rawTest() {
    console.log('🔍 Raw Contract Testing...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    const YOUR_ADDRESS = "0x247e45568b8df8fce4bb59394043c4e8d3a9a0a5";
    
    try {
        console.log('📊 Testing Raw Calls:');
        
        // Test saleActive (should work)
        try {
            const saleActiveData = "0x68428a1b"; // saleActive()
            const result1 = await provider.call({
                to: PRESALE_CONTRACT,
                data: saleActiveData
            });
            console.log('✅ saleActive():', parseInt(result1, 16) === 1);
        } catch (e) {
            console.log('❌ saleActive() failed:', e.message);
        }
        
        // Test currentPhase
        try {
            const phaseData = "0x055ad42e"; // currentPhase()
            const result2 = await provider.call({
                to: PRESALE_CONTRACT,
                data: phaseData
            });
            console.log('✅ currentPhase():', parseInt(result2, 16));
        } catch (e) {
            console.log('❌ currentPhase() failed:', e.message);
        }
        
        // Test owner
        try {
            const ownerData = "0x8da5cb5b"; // owner()
            const result3 = await provider.call({
                to: PRESALE_CONTRACT,
                data: ownerData
            });
            console.log('✅ owner():', '0x' + result3.slice(-40));
        } catch (e) {
            console.log('❌ owner() failed:', e.message);
        }
        
        // Create a minimal working purchase
        console.log('\n🛒 Testing Minimal Purchase:');
        
        // Use hardcoded values instead of reading from contract
        const tokenAmount = ethers.utils.parseEther("1000");
        const costETH = ethers.utils.parseEther("0.007"); // Genesis price
        
        console.log('Token Amount:', ethers.utils.formatEther(tokenAmount));
        console.log('Cost:', ethers.utils.formatEther(costETH), 'ETH');
        
        // Create buyTokens call data manually
        const buyTokensSignature = "0x3610724e"; // buyTokens(uint256)
        const tokenAmountHex = tokenAmount.toHexString().slice(2).padStart(64, '0');
        const callData = buyTokensSignature + tokenAmountHex;
        
        console.log('Call Data:', callData);
        
        // Test the call
        try {
            const result = await provider.call({
                to: PRESALE_CONTRACT,
                data: callData,
                value: costETH.toHexString(),
                from: YOUR_ADDRESS
            });
            console.log('✅ Purchase call would succeed');
        } catch (error) {
            console.log('❌ Purchase would fail:', error.reason || error.message);
            
            // Try different amounts
            const testCosts = [
                ethers.utils.parseEther("0.01"),   // Public price
                ethers.utils.parseEther("0.1"),    // 10x price
                ethers.utils.parseEther("7.0"),    // Raw calculation
            ];
            
            for (let i = 0; i < testCosts.length; i++) {
                try {
                    await provider.call({
                        to: PRESALE_CONTRACT,
                        data: callData,
                        value: testCosts[i].toHexString(),
                        from: YOUR_ADDRESS
                    });
                    console.log(`✅ Would work with ${ethers.utils.formatEther(testCosts[i])} ETH`);
                    break;
                } catch (e) {
                    console.log(`❌ ${ethers.utils.formatEther(testCosts[i])} ETH: ${e.reason || 'failed'}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Raw test error:', error.message);
    }
}

rawTest()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });