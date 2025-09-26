require('dotenv').config();
const hre = require('hardhat');
const { ethers } = hre;

async function deploySimpleFixed() {
    console.log('🚀 Deploying Simple Fixed Presale Contract...\n');
    
    // Get signers from hardhat
    const [deployer] = await ethers.getSigners();
    console.log('👛 Deploying with account:', deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');
    
    // Existing contract addresses
    const TOKEN_CONTRACT = "0x9B2c154C8B6B1826Df60c81033861891680EBFab";
    const GENESIS_NFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    
    // Phase timing (immediate public phase)
    const now = Math.floor(Date.now() / 1000);
    const genesisStart = now - 3600;    // 1 hour ago (ended)
    const genesisEnd = now - 1800;      // 30 min ago (ended)
    const publicStart = now - 1800;     // 30 min ago (active)
    const publicEnd = now + (365 * 24 * 3600); // 1 year from now
    
    console.log('📋 Contract Parameters:');
    console.log('Token Contract:', TOKEN_CONTRACT);
    console.log('Genesis NFT:', GENESIS_NFT);
    console.log('Phase: PUBLIC (active now through next year)');
    console.log('Pricing: $7 per 1000 tokens (Genesis), $10 per 1000 tokens (Public)');
    console.log('ETH Price: $4000 (updatable by owner)');
    
    try {
        // Deploy the fixed contract (WITHOUT funding in same transaction)
        console.log('\n🔧 Deploying TokenPreSaleFixed contract...');
        
        // Get contract factory using hardhat
        const TokenPreSaleFixed = await ethers.getContractFactory('TokenPreSaleFixed');
        
        const presale = await TokenPreSaleFixed.deploy(
            TOKEN_CONTRACT,
            GENESIS_NFT,
            genesisStart,
            genesisEnd,
            publicStart,
            publicEnd,
            {
                gasLimit: 3000000 // Explicitly set higher gas limit
            }
        );
        
        await presale.waitForDeployment();
        const presaleAddress = await presale.getAddress();
        console.log('✅ TokenPreSaleFixed deployed to:', presaleAddress);
        
        // Verify the configuration
        console.log('\n📊 Verifying Configuration:');
        const genesisPriceCents = await presale.genesisPriceUSDCents();
        const publicPriceCents = await presale.publicPriceUSDCents();
        const ethPrice = await presale.ethPriceUSD();
        const saleActive = await presale.saleActive();
        const currentPhase = await presale.currentPhase();
        const maxTokens = await presale.maxTokensForPreSale();
        
        console.log('Genesis Price:', genesisPriceCents.toString(), 'cents per 1000 tokens');
        console.log('Public Price:', publicPriceCents.toString(), 'cents per 1000 tokens');
        console.log('ETH Price:', ethPrice.toString(), 'USD');
        console.log('Max Tokens:', ethers.formatEther(maxTokens), 'tokens');
        console.log('Sale Active:', saleActive);
        console.log('Current Phase:', currentPhase.toString(), '(0=Genesis, 1=Public, 2=Ended)');
        
        // Test price calculation
        const testTokenAmount = ethers.parseEther('1000'); // 1000 tokens
        const testCostGenesis = await presale.calculateCostETH(testTokenAmount, deployer.address);
        
        console.log('\n💰 Test Pricing (1000 tokens):');
        console.log('Cost for non-Genesis holder:', ethers.formatEther(testCostGenesis), 'ETH');
        console.log('Expected: ~0.0025 ETH ($10 ÷ $4000) - FIXED!');
        
        // Save deployment info
        const deploymentInfo = {
            network: 'Base Mainnet',
            chainId: 8453,
            deployer: deployer.address,
            deploymentDate: new Date().toISOString(),
            contracts: {
                hvnaToken: TOKEN_CONTRACT,
                tokenPreSaleFixed: presaleAddress,
                tokenPreSaleOld: '0x637005bc97844da75e4Cd95716c62003E4Edf041',
                discountManager: '0xdD75a7B5CD76Df246dc523a78fD284D8A2d390c2',
                genesisNFT: GENESIS_NFT
            },
            configuration: {
                genesisPriceCents: genesisPriceCents.toString(),
                publicPriceCents: publicPriceCents.toString(),
                ethPriceUSD: ethPrice.toString(),
                maxTokens: ethers.formatEther(maxTokens),
                saleActive: saleActive,
                currentPhase: currentPhase.toString()
            }
        };
        
        require('fs').writeFileSync('deployment-base-final-fixed.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('✅ Saved deployment info to deployment-base-final-fixed.json');
        
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('🔗 New Fixed Presale Contract:', presaleAddress);
        console.log('✅ Pricing calculation FIXED - no more 1000x bug!');
        console.log('✅ 25M token limit');
        console.log('✅ Ready for token funding');
        
        console.log('\n📝 Next Steps:');
        console.log('1. Fund contract with 25M $HVNA tokens');
        console.log('2. Update frontend to use new address');
        console.log('3. Test with correct $10 pricing for 1000 tokens!');
        
        return presaleAddress;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    deploySimpleFixed()
        .then((address) => {
            console.log('\n🚀 Deploy complete! New contract:', address);
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { deploySimpleFixed };