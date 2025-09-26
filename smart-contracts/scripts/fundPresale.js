require('dotenv').config();
const { ethers } = require('ethers');

async function fundPresale() {
    console.log('💰 Funding Presale Contract...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    
    // Get deployer wallet
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Contract addresses
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    const TOKEN_CONTRACT = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
    
    // Token ABI for transfer
    const tokenABI = [
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)",
        "function owner() external view returns (address)"
    ];
    
    // Presale ABI 
    const presaleABI = [
        "function hvnaToken() external view returns (address)",
        "function maxTokensForPreSale() external view returns (uint256)",
        "function genesisPrice() external view returns (uint256)",
        "function publicPrice() external view returns (uint256)"
    ];
    
    try {
        const tokenContract = new ethers.Contract(TOKEN_CONTRACT, tokenABI, wallet);
        const presaleContract = new ethers.Contract(PRESALE_CONTRACT, presaleABI, provider);
        
        console.log('📊 Checking Contract Setup:');
        
        // Check if presale contract has the right token address
        const presaleTokenAddress = await presaleContract.hvnaToken();
        console.log('Presale Token Address:', presaleTokenAddress);
        console.log('Actual Token Address:', TOKEN_CONTRACT);
        console.log('Addresses Match:', presaleTokenAddress.toLowerCase() === TOKEN_CONTRACT.toLowerCase());
        
        // Check current token balance of presale contract
        const presaleBalance = await tokenContract.balanceOf(PRESALE_CONTRACT);
        console.log('Presale Contract Balance:', ethers.utils.formatEther(presaleBalance), 'HVNA');
        
        // Check max tokens for presale
        const maxTokens = await presaleContract.maxTokensForPreSale();
        console.log('Max Tokens for Presale:', ethers.utils.formatEther(maxTokens), 'HVNA');
        
        // Check deployer token balance
        const deployerBalance = await tokenContract.balanceOf(wallet.address);
        console.log('Deployer Balance:', ethers.utils.formatEther(deployerBalance), 'HVNA');
        
        // If presale contract has no tokens, send some
        if (presaleBalance.eq(0)) {
            console.log('\n🚀 Funding presale contract with tokens...');
            
            const tokensToSend = ethers.utils.parseEther("15000000"); // 15M tokens
            const transferTx = await tokenContract.transfer(PRESALE_CONTRACT, tokensToSend);
            console.log('Transfer TX:', transferTx.hash);
            await transferTx.wait();
            
            const newBalance = await tokenContract.balanceOf(PRESALE_CONTRACT);
            console.log('✅ New Presale Balance:', ethers.utils.formatEther(newBalance), 'HVNA');
        }
        
        // Try to read prices now
        console.log('\n💰 Testing Price Reading:');
        try {
            const genesisPrice = await presaleContract.genesisPrice();
            const publicPrice = await presaleContract.publicPrice();
            console.log('✅ Genesis Price:', ethers.utils.formatEther(genesisPrice), 'ETH');
            console.log('✅ Public Price:', ethers.utils.formatEther(publicPrice), 'ETH');
        } catch (error) {
            console.log('❌ Still can\'t read prices:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error funding presale:', error.message);
    }
}

fundPresale()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });