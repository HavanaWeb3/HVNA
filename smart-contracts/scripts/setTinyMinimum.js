require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function setTinyMinimum() {
    console.log('🔧 Setting Tiny Minimum Purchase (0.1 tokens)...\n');
    
    const [deployer] = await ethers.getSigners();
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    // Set minimum to 0.1 tokens (0.1 * 10^18 wei)
    const newMin = ethers.parseEther('0.1');
    const currentMaxGenesis = await presale.maxPurchaseGenesis();
    const currentMaxPublic = await presale.maxPurchasePublic();
    
    console.log('🔄 Setting minimum to:', ethers.formatEther(newMin), '$HVNA tokens');
    
    const costFor01Token = await presale.calculateCostETH(newMin, deployer.address);
    console.log('Cost for 0.1 token:', ethers.formatEther(costFor01Token), 'ETH (~$' + (parseFloat(ethers.formatEther(costFor01Token)) * 4000).toFixed(2) + ')');
    
    const userBalance = await ethers.provider.getBalance(deployer.address);
    console.log('User balance:', ethers.formatEther(userBalance), 'ETH');
    
    if (BigInt(userBalance.toString()) >= BigInt(costFor01Token.toString())) {
        console.log('✅ Can afford this amount!');
        
        try {
            const tx = await presale.setPurchaseLimits(newMin, currentMaxGenesis, currentMaxPublic, {
                gasLimit: 100000
            });
            
            await tx.wait();
            console.log('✅ Minimum updated to 0.1 tokens');
            
            // Now try the actual purchase
            console.log('\n🚀 Attempting purchase of 0.1 tokens...');
            
            const purchaseTx = await presale.buyTokens(newMin, {
                value: costFor01Token,
                gasLimit: 200000
            });
            
            console.log('📤 Purchase transaction:', purchaseTx.hash);
            console.log('⏳ Waiting for confirmation...');
            
            const receipt = await purchaseTx.wait();
            
            if (receipt.status === 1) {
                console.log('🎉 SUCCESS! Purchase completed!');
                console.log('✅ Purchased: 0.1 $HVNA tokens');
                console.log('💰 Cost:', ethers.formatEther(costFor01Token), 'ETH');
                
                // Check updated stats
                const tokensSold = await presale.tokensSold();
                const userTokens = await presale.purchasedAmount(deployer.address);
                
                console.log('\n📊 Updated Stats:');
                console.log('Total Tokens Sold:', ethers.formatEther(tokensSold));
                console.log('Your Tokens:', ethers.formatEther(userTokens));
                
                // Check remaining balance
                const newBalance = await ethers.provider.getBalance(deployer.address);
                console.log('Remaining ETH:', ethers.formatEther(newBalance));
                
                return true;
            } else {
                console.log('❌ Purchase transaction failed');
                return false;
            }
            
        } catch (error) {
            console.log('❌ Transaction failed:', error.message);
            return false;
        }
        
    } else {
        console.log('❌ Still cannot afford 0.1 tokens');
        console.log('   Need:', ethers.formatEther(costFor01Token), 'ETH');
        console.log('   Have:', ethers.formatEther(userBalance), 'ETH');
        return false;
    }
}

if (require.main === module) {
    setTinyMinimum()
        .then((success) => {
            if (success) {
                console.log('\n🎉 Test purchase successful!');
            } else {
                console.log('\n❌ Test purchase failed');
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error.message);
            process.exit(1);
        });
}