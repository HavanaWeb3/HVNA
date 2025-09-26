require('dotenv').config();
const { ethers } = require('ethers');

async function activatePresale() {
    console.log('🚀 Activating $HVNA Token Presale...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    
    // Get deployer wallet
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ DEPLOYER_PRIVATE_KEY not found in environment variables');
        process.exit(1);
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('👛 Wallet Address:', wallet.address);
    
    // Contract addresses from deployment
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    const TOKEN_CONTRACT = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
    
    // Presale contract ABI (minimal - just what we need)
    const presaleABI = [
        "function toggleSale() external",
        "function saleActive() external view returns (bool)",
        "function owner() external view returns (address)",
        "function hvnaToken() external view returns (address)"
    ];
    
    // Connect to presale contract
    const presaleContract = new ethers.Contract(PRESALE_CONTRACT, presaleABI, wallet);
    
    try {
        // Check current status
        console.log('📊 Checking current presale status...');
        const currentOwner = await presaleContract.owner();
        const isActive = await presaleContract.saleActive();
        const tokenAddress = await presaleContract.hvnaToken();
        
        console.log('Contract Owner:', currentOwner);
        console.log('Wallet Address:', wallet.address);
        console.log('Sale Active:', isActive);
        console.log('Token Contract:', tokenAddress);
        
        // Verify we're the owner
        if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
            console.error('❌ Not the contract owner! Cannot activate sale.');
            console.error('Contract owner:', currentOwner);
            console.error('Your address:', wallet.address);
            process.exit(1);
        }
        
        if (isActive) {
            console.log('✅ Sale is already active!');
            return;
        }
        
        // Get current gas price and wallet balance
        const gasPrice = await provider.getGasPrice();
        const balance = await provider.getBalance(wallet.address);
        
        console.log('\n💰 Gas Info:');
        console.log('Gas Price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
        console.log('Wallet Balance:', ethers.utils.formatEther(balance), 'ETH');
        
        // Activate the sale
        console.log('\n🔥 Activating presale...');
        const tx = await presaleContract.toggleSale();
        console.log('Transaction Hash:', tx.hash);
        
        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed! Block:', receipt.blockNumber);
        
        // Verify activation
        const newStatus = await presaleContract.saleActive();
        console.log('\n🚀 PRESALE ACTIVATION SUCCESSFUL!');
        console.log('Sale Active:', newStatus);
        
        if (newStatus) {
            console.log('\n🎉 $HVNA TOKEN PRESALE IS NOW LIVE!');
            console.log('🔗 Users can now purchase tokens at the website');
            console.log('💰 Price: $0.01 per token ($0.007 for Genesis holders)');
        } else {
            console.log('❌ Activation failed - sale is still inactive');
        }
        
    } catch (error) {
        console.error('❌ Error activating presale:', error.message);
        
        if (error.code === 'CALL_EXCEPTION') {
            console.error('Contract call failed. Check if you have the right permissions.');
        }
        
        process.exit(1);
    }
}

// Run the activation
activatePresale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });