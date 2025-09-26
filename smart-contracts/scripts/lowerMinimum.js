require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function lowerMinimum() {
    console.log('🔧 Lowering Minimum Purchase Requirement...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Using account:', deployer.address);
    
    // Contract address
    const contractAddress = "0x637005bc97844da75e4Cd95716c62003E4Edf041";
    
    // Get contract instance
    const presale = await ethers.getContractAt('TokenPreSaleFixed', contractAddress);
    
    // Check current minimums
    const currentMin = await presale.minPurchase();
    const currentMaxGenesis = await presale.maxPurchaseGenesis();
    const currentMaxPublic = await presale.maxPurchasePublic();
    
    console.log('📊 Current Purchase Limits:');
    console.log('Minimum:', ethers.formatEther(currentMin), '$HVNA tokens');
    console.log('Max Genesis:', ethers.formatEther(currentMaxGenesis), '$HVNA tokens');
    console.log('Max Public:', ethers.formatEther(currentMaxPublic), '$HVNA tokens');
    
    // Set much lower minimum (1 token) to make testing affordable
    const newMin = ethers.parseEther('1'); // 1 token minimum
    const newMaxGenesis = currentMaxGenesis; // Keep same
    const newMaxPublic = currentMaxPublic; // Keep same
    
    console.log('\n🔄 Updating to new limits:');
    console.log('New Minimum:', ethers.formatEther(newMin), '$HVNA tokens');
    console.log('Cost with bug:', ethers.formatEther(await presale.calculateCostETH(newMin, deployer.address)), 'ETH');
    
    try {
        console.log('📤 Calling setPurchaseLimits...');
        const tx = await presale.setPurchaseLimits(newMin, newMaxGenesis, newMaxPublic, {
            gasLimit: 100000
        });
        
        await tx.wait();
        console.log('✅ Purchase limits updated!');
        
        // Verify the change
        const newMinCheck = await presale.minPurchase();
        console.log('✅ Verified new minimum:', ethers.formatEther(newMinCheck), '$HVNA tokens');
        
        // Now test if we can afford 1 token
        const userBalance = await ethers.provider.getBalance(deployer.address);
        const costFor1Token = await presale.calculateCostETH(newMin, deployer.address);
        
        console.log('\n💰 After Update:');
        console.log('User Balance:', ethers.formatEther(userBalance), 'ETH');
        console.log('Cost for 1 token:', ethers.formatEther(costFor1Token), 'ETH');
        
        if (BigInt(userBalance.toString()) >= BigInt(costFor1Token.toString())) {
            console.log('✅ Can now afford minimum purchase!');
            console.log('🎯 Ready to test with 1 token purchase');
        } else {
            console.log('❌ Still cannot afford even 1 token');
        }
        
    } catch (error) {
        console.error('❌ Failed to update limits:', error.message);
    }
    
    return contractAddress;
}

if (require.main === module) {
    lowerMinimum()
        .then((address) => {
            console.log('\n✅ Update complete for contract:', address);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Update failed:', error.message);
            process.exit(1);
        });
}

module.exports = { lowerMinimum };