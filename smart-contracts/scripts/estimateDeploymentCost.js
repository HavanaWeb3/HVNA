require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function estimateDeploymentCost() {
    console.log('💰 Estimating Deployment Cost for Fixed Contract...\n');
    
    const [deployer] = await ethers.getSigners();
    console.log('👛 Deployer account:', deployer.address);
    
    const currentBalance = await ethers.provider.getBalance(deployer.address);
    console.log('💳 Current balance:', ethers.formatEther(currentBalance), 'ETH');
    
    // Get current gas prices
    const feeData = await ethers.provider.getFeeData();
    console.log('⛽ Current gas price:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'gwei');
    
    try {
        // Get the contract factory
        const TokenPreSaleFixed = await ethers.getContractFactory('TokenPreSaleFixed');
        
        // Contract constructor parameters
        const TOKEN_CONTRACT = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
        const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
        const now = Math.floor(Date.now() / 1000);
        const genesisStart = now - 3600;
        const genesisEnd = now - 1800;
        const publicStart = now - 1800;
        const publicEnd = now + (365 * 24 * 3600);
        
        // Estimate deployment gas
        const deployTx = TokenPreSaleFixed.getDeployTransaction(
            TOKEN_CONTRACT,
            GENESIS_NFT,
            genesisStart,
            genesisEnd,
            publicStart,
            publicEnd
        );
        
        const gasEstimate = await ethers.provider.estimateGas(deployTx);
        console.log('📊 Gas estimate for deployment:', gasEstimate.toString());
        
        // Calculate costs at different gas prices
        const gasPrices = [
            { name: 'Current', price: feeData.gasPrice },
            { name: 'Fast (+20%)', price: feeData.gasPrice * 6n / 5n },
            { name: 'Urgent (+50%)', price: feeData.gasPrice * 3n / 2n }
        ];
        
        console.log('\n💸 Deployment Cost Estimates:');
        for (const { name, price } of gasPrices) {
            const cost = gasEstimate * price;
            const costETH = ethers.formatEther(cost);
            const costUSD = (parseFloat(costETH) * 4000).toFixed(2);
            
            console.log(`${name}:`.padEnd(12), costETH, 'ETH (~$' + costUSD + ')');
        }
        
        // Add token funding cost
        console.log('\n📤 Additional Costs:');
        const tokenTransferGas = 65000n; // Approximate gas for token transfer
        const tokenTransferCost = tokenTransferGas * feeData.gasPrice;
        console.log('Token funding:', ethers.formatEther(tokenTransferCost), 'ETH (~$' + (parseFloat(ethers.formatEther(tokenTransferCost)) * 4000).toFixed(2) + ')');
        
        // Total cost
        const totalGas = gasEstimate + tokenTransferGas;
        const totalCost = totalGas * feeData.gasPrice;
        const totalCostETH = ethers.formatEther(totalCost);
        const totalCostUSD = (parseFloat(totalCostETH) * 4000).toFixed(2);
        
        console.log('\n🎯 TOTAL NEEDED:');
        console.log('Total Gas:', totalGas.toString());
        console.log('Total Cost:', totalCostETH, 'ETH (~$' + totalCostUSD + ')');
        console.log('Current Have:', ethers.formatEther(currentBalance), 'ETH');
        
        const deficit = totalCost - BigInt(currentBalance.toString());
        if (deficit > 0) {
            const deficitETH = ethers.formatEther(deficit);
            const deficitUSD = (parseFloat(deficitETH) * 4000).toFixed(2);
            console.log('❌ Need more:', deficitETH, 'ETH (~$' + deficitUSD + ')');
            
            console.log('\n💡 Options:');
            console.log('1. Add', deficitETH, 'ETH to deployer account');
            console.log('2. Wait for Base gas prices to drop');
            console.log('3. Use a different account with more ETH');
        } else {
            console.log('✅ Sufficient balance for deployment!');
        }
        
        // Show the fix that would be deployed
        console.log('\n🔧 Contract Fixes in New Deployment:');
        console.log('✅ Pricing calculation fixed (1000x bug resolved)');
        console.log('✅ 25M token limit instead of 15M');
        console.log('✅ 1000 token minimum (reasonable with correct pricing)');
        console.log('✅ All other functionality preserved');
        
        return {
            needed: totalCostETH,
            have: ethers.formatEther(currentBalance),
            deficit: deficit > 0 ? ethers.formatEther(deficit) : '0'
        };
        
    } catch (error) {
        console.error('❌ Estimation failed:', error.message);
        return null;
    }
}

if (require.main === module) {
    estimateDeploymentCost()
        .then((result) => {
            if (result && result.deficit !== '0') {
                console.log('\n🎯 SUMMARY: Need', result.deficit, 'more ETH for deployment');
            } else if (result) {
                console.log('\n🎯 SUMMARY: Ready to deploy!');
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Estimation failed:', error.message);
            process.exit(1);
        });
}