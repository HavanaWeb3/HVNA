require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function finalPurchaseTest() {
    console.log('🎯 Final Purchase Test (0.1 tokens with higher gas)...\n');
    
    const [deployer] = await ethers.getSigners();
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    // Check current minimum
    const currentMin = await presale.minPurchase();
    console.log('Current minimum:', ethers.formatEther(currentMin), '$HVNA tokens');
    
    if (currentMin.toString() !== ethers.parseEther('0.1').toString()) {
        console.log('❌ Minimum not set to 0.1 tokens. Current:', ethers.formatEther(currentMin));
        return false;
    }
    
    const tokenAmount = ethers.parseEther('0.1'); // 0.1 tokens
    const cost = await presale.calculateCostETH(tokenAmount, deployer.address);
    const userBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log('💰 Purchase Details:');
    console.log('Amount:', ethers.formatEther(tokenAmount), '$HVNA tokens');
    console.log('Cost:', ethers.formatEther(cost), 'ETH (~$' + (parseFloat(ethers.formatEther(cost)) * 4000).toFixed(2) + ')');
    console.log('Balance:', ethers.formatEther(userBalance), 'ETH');
    
    // Calculate total cost including gas
    const gasEstimate = await presale.buyTokens.estimateGas(tokenAmount, { value: cost });
    const gasPrice = await ethers.provider.getFeeData();
    const gasCost = gasEstimate * gasPrice.gasPrice;
    const totalCost = BigInt(cost.toString()) + BigInt(gasCost.toString());
    
    console.log('Gas estimate:', gasEstimate.toString());
    console.log('Gas cost:', ethers.formatEther(gasCost), 'ETH');
    console.log('Total cost:', ethers.formatEther(totalCost), 'ETH');
    
    if (BigInt(userBalance.toString()) >= totalCost) {
        console.log('✅ Sufficient balance for purchase + gas');
        
        try {
            console.log('\n🚀 Executing purchase...');
            
            const tx = await presale.buyTokens(tokenAmount, {
                value: cost,
                gasLimit: gasEstimate + BigInt(50000), // Add buffer
                gasPrice: gasPrice.gasPrice + gasPrice.gasPrice / BigInt(10) // 10% higher gas price
            });
            
            console.log('📤 Transaction hash:', tx.hash);
            console.log('⏳ Waiting for confirmation...');
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                console.log('🎉 PURCHASE SUCCESSFUL!');
                console.log('✅ Purchased: 0.1 $HVNA tokens');
                console.log('💰 Paid:', ethers.formatEther(cost), 'ETH');
                console.log('⛽ Gas used:', receipt.gasUsed.toString());
                
                // Verify purchase
                const tokensSold = await presale.tokensSold();
                const userTokens = await presale.purchasedAmount(deployer.address);
                const finalBalance = await ethers.provider.getBalance(deployer.address);
                
                console.log('\n📊 Final Stats:');
                console.log('Total Tokens Sold:', ethers.formatEther(tokensSold));
                console.log('Your Token Balance:', ethers.formatEther(userTokens));
                console.log('Your ETH Balance:', ethers.formatEther(finalBalance));
                
                console.log('\n🎯 Contract is working! Ready for real users.');
                return true;
                
            } else {
                console.log('❌ Transaction failed');
                return false;
            }
            
        } catch (error) {
            console.log('❌ Transaction error:', error.message);
            return false;
        }
        
    } else {
        console.log('❌ Insufficient balance');
        console.log('   Need:', ethers.formatEther(totalCost), 'ETH');
        console.log('   Have:', ethers.formatEther(userBalance), 'ETH');
        return false;
    }
}

if (require.main === module) {
    finalPurchaseTest()
        .then((success) => {
            if (success) {
                console.log('\n🏆 TEST PASSED - Contract is functional!');
            } else {
                console.log('\n❌ TEST FAILED');
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error.message);
            process.exit(1);
        });
}