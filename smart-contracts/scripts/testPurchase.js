require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function testPurchase() {
    console.log('🧪 Testing Token Purchase (1000 tokens)...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract address
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    
    // Get contract instance
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    // Check current state
    console.log('📊 Pre-Purchase State:');
    const saleActive = await presale.saleActive();
    const currentPhase = await presale.currentPhase();
    const tokensSoldBefore = await presale.tokensSold();
    const userTokensBefore = await presale.purchasedAmount(deployer.address);
    
    console.log('Sale Active:', saleActive);
    console.log('Current Phase:', currentPhase.toString(), '(0=Genesis, 1=Public, 2=Ended)');
    console.log('Tokens Sold Before:', ethers.formatEther(tokensSoldBefore));
    console.log('User Tokens Before:', ethers.formatEther(userTokensBefore));
    
    // Calculate cost for 1000 tokens
    const tokenAmount = ethers.parseEther('1000');
    const costETH = await presale.calculateCostETH(tokenAmount, deployer.address);
    console.log('\n💰 Purchase Details:');
    console.log('Token Amount:', ethers.formatEther(tokenAmount), '$HVNA');
    console.log('Cost (contract bug):', ethers.formatEther(costETH), 'ETH');
    console.log('Should cost:', '0.0025 ETH (correct price)');
    
    // Check if user has enough ETH
    const userBalance = await ethers.provider.getBalance(deployer.address);
    console.log('User ETH Balance:', ethers.formatEther(userBalance), 'ETH');
    
    if (BigInt(userBalance.toString()) < BigInt(costETH.toString())) {
        console.log('❌ Insufficient ETH for purchase');
        console.log('   Need:', ethers.formatEther(costETH), 'ETH');
        console.log('   Have:', ethers.formatEther(userBalance), 'ETH');
        return false;
    }
    
    console.log('✅ Ready for purchase!');
    console.log('\nTo complete the purchase:');
    console.log('1. Go to http://localhost:5173/');
    console.log('2. Connect your wallet (MetaMask)');
    console.log('3. Make sure you\'re on Base network');
    console.log('4. Enter 1000 in the token amount field');
    console.log('5. Click "Purchase $HVNA Tokens"');
    console.log('6. Confirm the transaction in MetaMask');
    
    console.log('\n⚠️  Expected Transaction:');
    console.log('- You will pay:', ethers.formatEther(costETH), 'ETH');
    console.log('- You will receive: 1000 $HVNA tokens');
    console.log('- Gas fee: ~0.0001 ETH additional');
    
    return true;
}

if (require.main === module) {
    testPurchase()
        .then((ready) => {
            if (ready) {
                console.log('\n🎉 Ready to test purchase!');
            } else {
                console.log('\n❌ Not ready for purchase');
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error.message);
            process.exit(1);
        });
}

module.exports = { testPurchase };