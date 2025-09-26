require('dotenv').config();
const { ethers } = require('ethers');

async function fixContractPrices() {
    console.log('🔧 FIXING CONTRACT PRICES - They are 1000x too high!\n');
    
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
        
        console.log('💰 CORRECT Pricing:');
        console.log('Target: $7 for 1000 tokens (Genesis), $10 for 1000 tokens (Public)');
        console.log('At $4000 ETH:');
        console.log('- $7 = 0.00175 ETH for 1000 tokens = 0.00000175 ETH per token');
        console.log('- $10 = 0.0025 ETH for 1000 tokens = 0.0000025 ETH per token');
        
        // CORRECT prices (1000x smaller than current)
        const genesisPriceWei = ethers.utils.parseEther("0.00000175");  // $0.007 per token
        const publicPriceWei = ethers.utils.parseEther("0.0000025");    // $0.01 per token
        
        console.log('\n🔧 New Prices:');
        console.log('Genesis:', ethers.utils.formatEther(genesisPriceWei), 'ETH per token');
        console.log('Public:', ethers.utils.formatEther(publicPriceWei), 'ETH per token');
        
        console.log('\n📊 Cost for 1000 tokens:');
        const genesis1000 = genesisPriceWei.mul(1000);
        const public1000 = publicPriceWei.mul(1000);
        console.log('Genesis (1000 tokens):', ethers.utils.formatEther(genesis1000), 'ETH ($7)');
        console.log('Public (1000 tokens):', ethers.utils.formatEther(public1000), 'ETH ($10)');
        console.log('Your balance: 0.005 ETH');
        console.log('Can afford Genesis? ', parseFloat(ethers.utils.formatEther(genesis1000)) <= 0.005 ? '✅ YES!' : '❌ No');
        console.log('Can afford Public? ', parseFloat(ethers.utils.formatEther(public1000)) <= 0.005 ? '✅ YES!' : '❌ No');
        
        // Try to set the prices
        console.log('\n🚀 Setting correct prices...');
        
        const tx = await contract.setPricing(genesisPriceWei, publicPriceWei, {
            gasLimit: 200000 // Extra gas
        });
        
        console.log('Transaction:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ SUCCESS! Prices fixed!');
        
        // Verify
        const newGenesis = await contract.genesisPrice();
        const newPublic = await contract.publicPrice();
        
        console.log('\n🎉 Verification:');
        console.log('New Genesis Price:', ethers.utils.formatEther(newGenesis), 'ETH per token');
        console.log('New Public Price:', ethers.utils.formatEther(newPublic), 'ETH per token');
        
        console.log('\n🎯 NOW YOU CAN TEST!');
        console.log('1000 tokens will cost:', ethers.utils.formatEther(newGenesis.mul(1000)), 'ETH (Genesis)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('Discount cannot exceed 100%')) {
            console.log('\n💡 The contract validation is preventing this.');
            console.log('The ratio between genesis and public price must be within limits.');
            console.log('Let me try with a smaller discount...');
            
            // Try with smaller discount (20% instead of 30%)
            const publicPriceWei2 = ethers.utils.parseEther("0.0000025");
            const genesisPriceWei2 = ethers.utils.parseEther("0.000002");  // 20% discount
            
            try {
                const tx2 = await contract.setPricing(genesisPriceWei2, publicPriceWei2);
                console.log('Trying with 20% discount...');
                await tx2.wait();
                console.log('✅ SUCCESS with smaller discount!');
            } catch (e2) {
                console.log('❌ Still failed. The contract validation is too strict.');
            }
        }
    }
}

fixContractPrices()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });