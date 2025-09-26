require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function debugPricing() {
    console.log('🔍 Debugging Contract Pricing...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract address from deployment
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    
    // Get contract instance
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    console.log('📊 Contract Parameters:');
    const genesisPriceCents = await presale.genesisPriceUSDCents();
    const publicPriceCents = await presale.publicPriceUSDCents();
    const ethPrice = await presale.ethPriceUSD();
    
    console.log('Genesis Price:', genesisPriceCents.toString(), 'cents per 1000 tokens');
    console.log('Public Price:', publicPriceCents.toString(), 'cents per 1000 tokens');
    console.log('ETH Price:', ethPrice.toString(), 'USD');
    
    // Manual calculation for 1000 tokens
    const tokenAmount = ethers.parseEther('1000'); // 1000 * 10^18
    console.log('\n🧮 Manual Calculation for 1000 tokens:');
    console.log('Token Amount (wei):', tokenAmount.toString());
    console.log('Token Amount (ether):', ethers.formatEther(tokenAmount));
    
    // Expected calculation:
    // For public: 1000 tokens should cost $10 (1000 cents)
    // At $4000 ETH: $10 / $4000 = 0.0025 ETH
    console.log('\n Expected calculation:');
    console.log('1000 tokens × $10/1000tokens = $10');
    console.log('$10 ÷ $4000/ETH = 0.0025 ETH');
    
    // Contract calculation
    const contractCost = await presale.calculateCostETH(tokenAmount, deployer.address);
    console.log('\n📋 Contract Result:');
    console.log('Contract cost (wei):', contractCost.toString());
    console.log('Contract cost (ether):', ethers.formatEther(contractCost));
    
    // Debug the math step by step
    console.log('\n🔍 Debug Contract Math:');
    console.log('Step 1: tokenAmount * publicPriceCents =', tokenAmount.toString(), '×', publicPriceCents.toString());
    
    // The issue might be in the division
    // Current contract: (tokenAmount * priceCents) / 10**18
    // Should be: (tokenAmount * priceCents) / (10**18 * 1000) for "cents per 1000 tokens"
    
    console.log('\n❌ Current (wrong) calculation in deployed contract:');
    console.log('totalCostCents = (tokenAmount * priceCents) / 10**18');
    console.log('totalCostCents =', tokenAmount.toString(), '×', publicPriceCents.toString(), '÷ 10^18');
    
    const wrongCostCents = tokenAmount * BigInt(publicPriceCents.toString()) / BigInt('1000000000000000000');
    console.log('totalCostCents =', wrongCostCents.toString(), 'cents (WRONG - way too big!)');
    
    console.log('\n✅ Correct calculation should be:');
    console.log('totalCostCents = (tokenAmount * priceCents) / (10**18 * 1000)');
    console.log('totalCostCents =', tokenAmount.toString(), '×', publicPriceCents.toString(), '÷ (10^18 × 1000)');
    
    const correctCostCents = tokenAmount * BigInt(publicPriceCents.toString()) / (BigInt('1000000000000000000') * BigInt('1000'));
    console.log('totalCostCents =', correctCostCents.toString(), 'cents (CORRECT)');
    
    const correctCostETH = correctCostCents * BigInt('1000000000000000000') / (BigInt('100') * BigInt('4000'));
    console.log('costETH =', correctCostCents.toString(), '× 10^18 ÷ (100 × 4000) =', correctCostETH.toString(), 'wei');
    console.log('costETH =', ethers.formatEther(correctCostETH.toString()), 'ETH');
    
    console.log('\n🎯 Summary:');
    console.log('Contract returns:', ethers.formatEther(contractCost), 'ETH (WRONG)');
    console.log('Should return:', ethers.formatEther(correctCostETH.toString()), 'ETH (CORRECT)');
}

if (require.main === module) {
    debugPricing()
        .then(() => {
            console.log('\n✅ Debug complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Debug failed:', error.message);
            process.exit(1);
        });
}

module.exports = { debugPricing };