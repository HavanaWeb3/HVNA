require('dotenv').config();
const { ethers } = require('ethers');

async function fixPhasing() {
    console.log('🔧 Fixing Presale Phasing...\n');
    
    // Connect to Base mainnet
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    
    // Get deployer wallet
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Contract address
    const PRESALE_CONTRACT = "0x447dddB5115874698FCc3840e24Dc7EfE22deb3b";
    
    // ABI for phase management
    const presaleABI = [
        "function updatePhase() external",
        "function forcePhaseChange(uint8 newPhase) external",
        "function setPhaseTiming(uint256 _genesisStart, uint256 _genesisEnd, uint256 _publicStart, uint256 _publicEnd) external",
        "function currentPhase() external view returns (uint8)",
        "function saleActive() external view returns (bool)",
        "function owner() external view returns (address)"
    ];
    
    try {
        const contract = new ethers.Contract(PRESALE_CONTRACT, presaleABI, wallet);
        
        console.log('📊 Current Status:');
        const currentPhase = await contract.currentPhase();
        const saleActive = await contract.saleActive();
        const owner = await contract.owner();
        
        console.log('Current Phase:', currentPhase.toString());
        console.log('Sale Active:', saleActive);
        console.log('Owner:', owner);
        console.log('Wallet:', wallet.address);
        
        // Set up timing for immediate public phase
        const now = Math.floor(Date.now() / 1000);
        const genesisStart = now - 3600; // 1 hour ago
        const genesisEnd = now - 1800;   // 30 minutes ago
        const publicStart = now - 1800;  // 30 minutes ago
        const publicEnd = now + (365 * 24 * 3600); // 1 year from now
        
        console.log('\n🕒 Setting Phase Timing:');
        console.log('Genesis Phase: ENDED (past)');
        console.log('Public Phase: ACTIVE (now through next year)');
        
        // Update phase timing
        console.log('\n⏰ Updating phase timing...');
        const timingTx = await contract.setPhaseTiming(genesisStart, genesisEnd, publicStart, publicEnd);
        console.log('Timing TX:', timingTx.hash);
        await timingTx.wait();
        console.log('✅ Phase timing updated');
        
        // Force phase update
        console.log('\n🔄 Updating current phase...');
        const updateTx = await contract.updatePhase();
        console.log('Update TX:', updateTx.hash);
        await updateTx.wait();
        console.log('✅ Phase updated');
        
        // Check new phase
        const newPhase = await contract.currentPhase();
        console.log('\n📊 New Status:');
        console.log('Current Phase:', newPhase.toString(), '(0=Genesis, 1=Public, 2=Ended)');
        
        if (newPhase.toString() === '1') {
            console.log('🎉 SUCCESS! Presale is now in PUBLIC PHASE');
            console.log('✅ Genesis holders get discounts');
            console.log('✅ Public can purchase at regular price');
        } else if (newPhase.toString() === '0') {
            console.log('📝 Still in Genesis phase, forcing to Public...');
            const forceTx = await contract.forcePhaseChange(1);
            console.log('Force TX:', forceTx.hash);
            await forceTx.wait();
            console.log('✅ Forced to Public phase');
        }
        
        console.log('\n🚀 Presale should now work for token purchases!');
        
    } catch (error) {
        console.error('❌ Error fixing phasing:', error.message);
    }
}

fixPhasing()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });