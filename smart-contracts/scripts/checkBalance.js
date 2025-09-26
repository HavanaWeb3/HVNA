require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function checkBalance() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceETH = ethers.formatEther(balance);
    const balanceUSD = (parseFloat(balanceETH) * 4000).toFixed(2);
    
    console.log('Account:', deployer.address);
    console.log('Balance:', balanceETH, 'ETH');
    console.log('Value: ~$' + balanceUSD);
    
    return balanceETH;
}

checkBalance().then(() => process.exit(0));
