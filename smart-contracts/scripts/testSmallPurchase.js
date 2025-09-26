require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function testSmallPurchase() {
    console.log('🧪 Testing Small Token Purchase (1 token only)...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract address
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    
    // Get contract instance
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    // Calculate cost for just 1 token (minimum reasonable test)
    const tokenAmount = ethers.parseEther('1'); // Just 1 token
    const costETH = await presale.calculateCostETH(tokenAmount, deployer.address);
    const userBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log('💰 Small Purchase Test:');
    console.log('Token Amount:', ethers.formatEther(tokenAmount), '$HVNA tokens');
    console.log('Cost (contract bug):', ethers.formatEther(costETH), 'ETH (~$' + (parseFloat(ethers.formatEther(costETH)) * 4000).toFixed(2) + ')');
    console.log('Should cost:', '0.0000025 ETH (~$0.01)');
    console.log('User ETH Balance:', ethers.formatEther(userBalance), 'ETH');
    
    // Check minimum purchase requirement
    const minPurchase = await presale.minPurchase();
    console.log('\n📋 Contract Requirements:');
    console.log('Minimum Purchase:', ethers.formatEther(minPurchase), '$HVNA tokens');
    
    if (BigInt(tokenAmount.toString()) < BigInt(minPurchase.toString())) {
        console.log('❌ Cannot buy less than minimum:', ethers.formatEther(minPurchase), 'tokens');
        console.log('\n🔄 Testing with minimum amount...');
        
        const minTokenAmount = minPurchase;
        const minCostETH = await presale.calculateCostETH(minTokenAmount, deployer.address);
        
        console.log('Min Token Amount:', ethers.formatEther(minTokenAmount), '$HVNA tokens');
        console.log('Min Cost (bug):', ethers.formatEther(minCostETH), 'ETH (~$' + (parseFloat(ethers.formatEther(minCostETH)) * 4000).toFixed(2) + ')');
        console.log('Should cost:', (parseFloat(ethers.formatEther(minTokenAmount)) * 0.01 / 4000).toFixed(6), 'ETH');
        
        if (BigInt(userBalance.toString()) >= BigInt(minCostETH.toString())) {
            console.log('✅ Can afford minimum purchase!');
            
            console.log('\n🚀 Ready to execute transaction...');
            try {
                const tx = await presale.buyTokens(minTokenAmount, {
                    value: minCostETH,
                    gasLimit: 200000
                });
                
                console.log('📤 Transaction submitted:', tx.hash);
                console.log('⏳ Waiting for confirmation...');
                
                const receipt = await tx.wait();
                
                if (receipt.status === 1) {
                    console.log('✅ Purchase successful!');
                    console.log('🎉 Received:', ethers.formatEther(minTokenAmount), '$HVNA tokens');
                    
                    // Check updated balances
                    const tokensSoldAfter = await presale.tokensSold();
                    const userTokensAfter = await presale.purchasedAmount(deployer.address);
                    
                    console.log('📊 Updated Stats:');
                    console.log('Total Tokens Sold:', ethers.formatEther(tokensSoldAfter));
                    console.log('Your Tokens:', ethers.formatEther(userTokensAfter));
                } else {
                    console.log('❌ Transaction failed');
                }
                
            } catch (error) {
                console.log('❌ Transaction failed:', error.message);
            }
        } else {
            console.log('❌ Insufficient ETH for minimum purchase');
            console.log('   Need:', ethers.formatEther(minCostETH), 'ETH');
            console.log('   Have:', ethers.formatEther(userBalance), 'ETH');
        }
    }
    
    return true;
}

if (require.main === module) {
    testSmallPurchase()
        .then(() => {
            console.log('\n✅ Test complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error.message);
            process.exit(1);
        });
}

module.exports = { testSmallPurchase };