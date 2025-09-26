require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function updateMaxTokens() {
    console.log('🔧 Updating Max Tokens for PreSale...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract address
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    
    // Get contract instance
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    // Check current max tokens
    const currentMaxTokens = await presale.maxTokensForPreSale();
    console.log('📊 Current max tokens for presale:', ethers.formatEther(currentMaxTokens));
    
    // The contract doesn't have a function to update maxTokensForPreSale
    // Let's check what functions are available for the owner
    console.log('\n📋 Available Owner Functions:');
    console.log('- updateETHPrice(uint256)');
    console.log('- updateTokenPrices(uint256, uint256)');
    console.log('- setPhaseTiming(...)');
    console.log('- setPurchaseLimits(...)');
    console.log('- toggleSale()');
    console.log('- forcePhaseChange(Phase)');
    
    console.log('\n⚠️  The contract does not have a function to update maxTokensForPreSale');
    console.log('   This is hardcoded to 15M tokens in the constructor');
    console.log('   However, the contract has 25M tokens available, so users can still purchase');
    console.log('   up to 25M tokens total (the contract balance is the real limit)');
    
    // Let's check the actual token balance vs the limit
    const tokenContract = await ethers.getContractAt('contracts/TokenPreSaleFixed.sol:IERC20', "0x9B2c154C8B6B1826Df60c81033861891680EBFab");
    const contractBalance = await tokenContract.balanceOf(contractAddress);
    
    console.log('\n💰 Reality Check:');
    console.log('Contract max tokens (hardcoded):', ethers.formatEther(currentMaxTokens));
    console.log('Contract actual balance:', ethers.formatEther(contractBalance));
    console.log('Effective limit: min(hardcoded, balance) =', ethers.formatEther(currentMaxTokens));
    
    console.log('\n📝 Recommendation:');
    console.log('The purchase limit is still 15M tokens due to the hardcoded maxTokensForPreSale.');
    console.log('To sell all 25M tokens, you would need to deploy a new contract with maxTokensForPreSale = 25M');
    console.log('OR manually withdraw and re-add tokens after selling the first 15M');
    
    return {
        contractAddress,
        maxTokensHardcoded: currentMaxTokens,
        actualBalance: contractBalance
    };
}

if (require.main === module) {
    updateMaxTokens()
        .then((result) => {
            console.log('\n✅ Analysis complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Analysis failed:', error.message);
            process.exit(1);
        });
}

module.exports = { updateMaxTokens };