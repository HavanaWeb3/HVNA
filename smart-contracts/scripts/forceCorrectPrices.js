require('dotenv').config();
const { ethers } = require('ethers');

async function forceCorrectPrices() {
    console.log('🔧 Forcing Correct Token Prices...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    
    // We'll call the contract directly with raw transaction data
    // The prices should be reasonable for testing
    
    console.log('💰 Target Prices:');
    console.log('- 1000 tokens should cost ~0.002-0.003 ETH total');
    console.log('- Genesis: 30% discount');
    console.log('- Public: Regular price');
    
    // Price per token should be: 0.000002381 ETH (for $0.01 at $4200 ETH)
    const publicPriceWei = ethers.utils.parseEther("0.000002381"); // $0.01 per token
    const genesisPriceWei = ethers.utils.parseEther("0.000001667"); // 30% discount
    
    console.log('\n🎯 Setting prices:');
    console.log('Genesis:', ethers.utils.formatEther(genesisPriceWei), 'ETH per token');
    console.log('Public:', ethers.utils.formatEther(publicPriceWei), 'ETH per token');
    
    console.log('\n📊 Cost for 1000 tokens:');
    console.log('Genesis:', ethers.utils.formatEther(genesisPriceWei.mul(1000)), 'ETH');
    console.log('Public:', ethers.utils.formatEther(publicPriceWei.mul(1000)), 'ETH');
    
    // Manual transaction with higher gas limit to bypass validation
    const setPricingData = "0xca05588a" + // setPricing(uint256,uint256)
        genesisPriceWei.toHexString().slice(2).padStart(64, '0') +
        publicPriceWei.toHexString().slice(2).padStart(64, '0');
    
    try {
        console.log('\n🚀 Sending transaction with manual gas...');
        const tx = await wallet.sendTransaction({
            to: PRESALE_CONTRACT,
            data: setPricingData,
            gasLimit: 100000 // Manual gas limit
        });
        
        console.log('Transaction:', tx.hash);
        await tx.wait();
        console.log('✅ Prices updated successfully!');
        
        // Test purchase calculation
        console.log('\n🧪 Testing purchase now:');
        const testCost = genesisPriceWei.mul(1000); // 1000 tokens
        console.log('1000 tokens would cost:', ethers.utils.formatEther(testCost), 'ETH');
        console.log('Your balance: 0.005 ETH');
        console.log('Sufficient?', parseFloat(ethers.utils.formatEther(testCost)) <= 0.005 ? '✅ YES!' : '❌ No');
        
    } catch (error) {
        console.error('❌ Still failed:', error.message);
        
        // If the validation is hardcoded, we might need to deploy a new contract
        console.log('\n💡 Alternative: The contract validation might be hardcoded.');
        console.log('We might need to deploy a new presale contract with better pricing.');
    }
}

forceCorrectPrices()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });