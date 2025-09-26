require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function fundContractMore() {
    console.log('💸 Adding More Tokens to Presale Contract...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract addresses
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    const tokenAddress = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
    
    // Get contract instances
    const token = await ethers.getContractAt('contracts/TokenPreSaleFixed.sol:IERC20', tokenAddress);
    
    // Check current contract balance
    const currentBalance = await token.balanceOf(contractAddress);
    console.log('📊 Current contract balance:', ethers.formatEther(currentBalance), '$HVNA tokens');
    
    // Check deployer balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log('💰 Deployer balance:', ethers.formatEther(deployerBalance), '$HVNA tokens');
    
    // Calculate how many more tokens we need to send
    const targetBalance = ethers.parseEther('25000000'); // 25M tokens
    const currentBalanceBigInt = BigInt(currentBalance.toString());
    const targetBalanceBigInt = BigInt(targetBalance.toString());
    
    if (currentBalanceBigInt >= targetBalanceBigInt) {
        console.log('✅ Contract already has sufficient tokens (25M or more)');
        return contractAddress;
    }
    
    const tokensToSend = targetBalanceBigInt - currentBalanceBigInt;
    console.log('📤 Need to send:', ethers.formatEther(tokensToSend.toString()), 'more $HVNA tokens');
    
    // Check if deployer has enough tokens
    const deployerBalanceBigInt = BigInt(deployerBalance.toString());
    if (deployerBalanceBigInt < tokensToSend) {
        console.log('❌ Deployer does not have enough tokens');
        console.log('   Need:', ethers.formatEther(tokensToSend.toString()));
        console.log('   Have:', ethers.formatEther(deployerBalance));
        return contractAddress;
    }
    
    console.log('\n🔄 Sending additional tokens to contract...');
    
    try {
        const transferTx = await token.transfer(contractAddress, tokensToSend.toString(), {
            gasLimit: 100000
        });
        
        await transferTx.wait();
        console.log('✅ Transfer successful!');
        
        // Verify new balance
        const newBalance = await token.balanceOf(contractAddress);
        console.log('📊 New contract balance:', ethers.formatEther(newBalance), '$HVNA tokens');
        
        console.log('\n🎉 Contract now funded with 25M $HVNA tokens!');
        
    } catch (error) {
        console.error('❌ Transfer failed:', error.message);
        throw error;
    }
    
    return contractAddress;
}

if (require.main === module) {
    fundContractMore()
        .then((address) => {
            console.log('\n✅ Funding complete for contract:', address);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Funding failed:', error.message);
            process.exit(1);
        });
}

module.exports = { fundContractMore };