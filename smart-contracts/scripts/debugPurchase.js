require('dotenv').config();
const { ethers } = require('ethers');

async function debugPurchase() {
    console.log('🔍 Debugging Token Purchase...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    
    // Contract addresses
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    const YOUR_ADDRESS = "0x247e45568b8df8fce4bb59394043c4e8d3a9a0a5";
    
    // Simple ABI for testing
    const presaleABI = [
        "function saleActive() external view returns (bool)",
        "function currentPhase() external view returns (uint8)",
        "function genesisPrice() external view returns (uint256)",
        "function publicPrice() external view returns (uint256)",
        "function buyTokens(uint256 tokenAmount) external payable"
    ];
    
    try {
        const contract = new ethers.Contract(PRESALE_CONTRACT, presaleABI, provider);
        
        // Check basic contract state
        console.log('📊 Contract State:');
        const saleActive = await contract.saleActive();
        console.log('Sale Active:', saleActive);
        
        const currentPhase = await contract.currentPhase();
        console.log('Current Phase:', currentPhase.toString());
        
        const genesisPrice = await contract.genesisPrice();
        const publicPrice = await contract.publicPrice();
        console.log('Genesis Price:', ethers.utils.formatEther(genesisPrice), 'ETH');
        console.log('Public Price:', ethers.utils.formatEther(publicPrice), 'ETH');
        
        // Test purchase parameters
        const tokenAmount = ethers.utils.parseEther("1000"); // 1000 tokens
        const priceToUse = genesisPrice; // You're a Genesis holder
        
        // Calculate cost (this might be where the issue is)
        console.log('\n💰 Purchase Calculation:');
        console.log('Token Amount:', ethers.utils.formatEther(tokenAmount));
        console.log('Price per token:', ethers.utils.formatEther(priceToUse));
        
        // The cost calculation should be: tokens * price_per_token
        // But the price might be per 1000 tokens or something else
        const costWei = tokenAmount.mul(priceToUse).div(ethers.utils.parseEther("1"));
        console.log('Calculated Cost:', ethers.utils.formatEther(costWei), 'ETH');
        
        // Try a static call to see what fails
        console.log('\n🧪 Testing Static Call:');
        try {
            const result = await provider.call({
                to: PRESALE_CONTRACT,
                data: contract.interface.encodeFunctionData("buyTokens", [tokenAmount]),
                value: costWei.toHexString(),
                from: YOUR_ADDRESS
            });
            console.log('✅ Static call successful');
        } catch (error) {
            console.log('❌ Static call failed:', error.reason || error.message);
            
            // Try with different amounts
            console.log('\n🔍 Trying different costs...');
            
            // Try with the exact contract prices
            const costs = [
                ethers.utils.parseEther("0.007"), // Genesis price direct
                ethers.utils.parseEther("0.01"),  // Public price direct
                tokenAmount.mul(genesisPrice),    // Without division
                costWei.mul(2),                   // Double the cost
            ];
            
            for (let i = 0; i < costs.length; i++) {
                try {
                    await provider.call({
                        to: PRESALE_CONTRACT,
                        data: contract.interface.encodeFunctionData("buyTokens", [tokenAmount]),
                        value: costs[i].toHexString(),
                        from: YOUR_ADDRESS
                    });
                    console.log(`✅ Success with cost ${i + 1}:`, ethers.utils.formatEther(costs[i]), 'ETH');
                    break;
                } catch (err) {
                    console.log(`❌ Failed cost ${i + 1}:`, ethers.utils.formatEther(costs[i]), 'ETH -', err.reason || 'Unknown');
                }
            }
        }
        
        // Check your balance
        const balance = await provider.getBalance(YOUR_ADDRESS);
        console.log('\n👛 Your Balance:', ethers.utils.formatEther(balance), 'ETH');
        
    } catch (error) {
        console.error('❌ Debug error:', error.message);
    }
}

debugPurchase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });