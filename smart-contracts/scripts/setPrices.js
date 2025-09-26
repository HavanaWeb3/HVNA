require('dotenv').config();
const { ethers } = require('ethers');

async function setPrices() {
    console.log('💰 Setting Correct Token Prices...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    
    const presaleABI = [
        "function setPricing(uint256 _genesisPrice, uint256 _publicPrice) external",
        "function genesisPrice() external view returns (uint256)",
        "function publicPrice() external view returns (uint256)"
    ];
    
    try {
        const contract = new ethers.Contract(PRESALE_CONTRACT, presaleABI, wallet);
        
        // Target: $0.01 per token, Genesis: $0.007 per token (30% discount)
        // At $4200 ETH: $0.01 = 0.01/4200 = ~0.0000024 ETH per token
        // Genesis: 30% discount = 0.0000024 * 0.7 = ~0.0000017 ETH per token
        
        const publicPriceETH = ethers.utils.parseEther("0.000002381"); // $0.01 at $4200 ETH
        const genesisPriceETH = ethers.utils.parseEther("0.000001667"); // 30% discount
        
        console.log('🔧 Setting new prices:');
        console.log('Genesis Price:', ethers.utils.formatEther(genesisPriceETH), 'ETH per token');
        console.log('Public Price:', ethers.utils.formatEther(publicPriceETH), 'ETH per token');
        
        console.log('📊 For 1000 tokens:');
        console.log('Genesis Cost:', ethers.utils.formatEther(genesisPriceETH.mul(1000)), 'ETH');
        console.log('Public Cost:', ethers.utils.formatEther(publicPriceETH.mul(1000)), 'ETH');
        
        const tx = await contract.setPricing(genesisPriceETH, publicPriceETH);
        console.log('\n🚀 Transaction:', tx.hash);
        await tx.wait();
        
        console.log('✅ Prices updated successfully!');
        
        // Verify
        const newGenesisPrice = await contract.genesisPrice();
        const newPublicPrice = await contract.publicPrice();
        
        console.log('\n📋 Verification:');
        console.log('New Genesis Price:', ethers.utils.formatEther(newGenesisPrice), 'ETH');
        console.log('New Public Price:', ethers.utils.formatEther(newPublicPrice), 'ETH');
        
    } catch (error) {
        console.error('❌ Error setting prices:', error.message);
    }
}

setPrices()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });