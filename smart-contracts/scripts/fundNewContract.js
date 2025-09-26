require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function fundNewContract() {
    console.log('💸 Funding New Fixed Contract with 25M Tokens...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // New contract address
    const newContractAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
    const tokenAddress = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
    
    // Get contract instances
    const token = await ethers.getContractAt('contracts/TokenPreSaleFixed.sol:IERC20', tokenAddress);
    
    // Check deployer balance
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log('💰 Deployer token balance:', ethers.formatEther(deployerBalance), '$HVNA tokens');
    
    // Check current contract balance
    const currentBalance = await token.balanceOf(newContractAddress);
    console.log('📊 Contract current balance:', ethers.formatEther(currentBalance), '$HVNA tokens');
    
    const tokensToSend = ethers.parseEther('25000000'); // 25M tokens
    console.log('📤 Sending:', ethers.formatEther(tokensToSend), '$HVNA tokens');
    
    // Check if deployer has enough tokens
    if (BigInt(deployerBalance.toString()) < BigInt(tokensToSend.toString())) {
        console.log('❌ Deployer does not have enough tokens');
        console.log('   Need:', ethers.formatEther(tokensToSend));
        console.log('   Have:', ethers.formatEther(deployerBalance));
        return false;
    }
    
    try {
        console.log('\n🔄 Transferring 25M tokens to new contract...');
        
        const transferTx = await token.transfer(newContractAddress, tokensToSend, {
            gasLimit: 100000
        });
        
        console.log('📤 Transaction submitted:', transferTx.hash);
        await transferTx.wait();
        console.log('✅ Transfer successful!');
        
        // Verify new balance
        const newBalance = await token.balanceOf(newContractAddress);
        console.log('📊 New contract balance:', ethers.formatEther(newBalance), '$HVNA tokens');
        
        console.log('\n🎉 CONTRACT FULLY FUNDED!');
        console.log('🔗 Contract Address:', newContractAddress);
        console.log('💰 Token Balance: 25,000,000 $HVNA');
        console.log('✅ Pricing: FIXED (0.0025 ETH for 1000 tokens)');
        console.log('🎯 Ready for production use!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Transfer failed:', error.message);
        return false;
    }
}

if (require.main === module) {
    fundNewContract()
        .then((success) => {
            if (success) {
                console.log('\n🏆 New contract is fully ready!');
                console.log('📝 Update frontend to: 0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E');
            } else {
                console.log('\n❌ Funding failed');
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Funding failed:', error.message);
            process.exit(1);
        });
}

module.exports = { fundNewContract };