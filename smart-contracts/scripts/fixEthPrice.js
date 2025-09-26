require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function fixETHPrice() {
    console.log('🔧 Fixing ETH Price in Deployed Contract...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract address from deployment
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    
    // Get contract instance
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    console.log('📊 Current Configuration:');
    const currentEthPrice = await presale.ethPriceUSD();
    console.log('Current ETH Price:', currentEthPrice.toString(), 'USD');
    
    // Test current pricing for 1000 tokens
    const testTokenAmount = ethers.parseEther('1000');
    const currentCost = await presale.calculateCostETH(testTokenAmount, deployer.address);
    console.log('Current cost for 1000 tokens:', ethers.formatEther(currentCost), 'ETH');
    
    // Update ETH price to $4000
    console.log('\n🔄 Updating ETH price to $4000...');
    const updateTx = await presale.updateETHPrice(4000, { gasLimit: 100000 });
    await updateTx.wait();
    console.log('✅ ETH price updated!');
    
    // Verify the update
    console.log('\n📊 Updated Configuration:');
    const newEthPrice = await presale.ethPriceUSD();
    console.log('New ETH Price:', newEthPrice.toString(), 'USD');
    
    // Test new pricing for 1000 tokens
    const newCost = await presale.calculateCostETH(testTokenAmount, deployer.address);
    console.log('New cost for 1000 tokens:', ethers.formatEther(newCost), 'ETH');
    console.log('Expected: ~0.0025 ETH ($10 ÷ $4000)');
    
    console.log('\n🎉 ETH Price Fixed Successfully!');
    return contractAddress;
}

if (require.main === module) {
    fixETHPrice()
        .then((address) => {
            console.log('\n✅ Contract pricing fixed:', address);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Fix failed:', error.message);
            process.exit(1);
        });
}

module.exports = { fixETHPrice };