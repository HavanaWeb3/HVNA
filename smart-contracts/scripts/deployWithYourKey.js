const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 DEPLOYING TO BASE WITH YOUR ADDRESS");
    console.log("=".repeat(50));
    
    // Use your private key temporarily for deployment
    const yourPrivateKey = "291e79fdbc0f90e9483058041074be50d560087ca3b28e4bdbb596e5c25c36ce";
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const deployer = new ethers.Wallet(yourPrivateKey, provider);
    
    console.log("Deployer address:", deployer.address);
    
    const balance = await provider.getBalance(deployer.address);
    const balanceETH = parseFloat(ethers.formatEther(balance));
    console.log("Available ETH:", balanceETH.toFixed(6), "ETH");
    
    if (balanceETH < 0.003) {
        console.error("❌ Insufficient balance");
        process.exit(1);
    }
    
    const startTime = Date.now();
    let deployedContracts = {};
    
    try {
        // Deploy Enhanced NFT Contract
        console.log("\n🎨 Deploying Enhanced NFT...");
        const BoldlyElephunkyNFTEnhanced = await ethers.getContractFactory("BoldlyElephunkyNFTEnhanced", deployer);
        
        const nftEnhanced = await BoldlyElephunkyNFTEnhanced.deploy({
            gasLimit: 3000000
        });
        
        console.log("⏳ Waiting for NFT deployment...");
        await nftEnhanced.waitForDeployment();
        const nftAddress = await nftEnhanced.getAddress();
        deployedContracts.nft = nftAddress;
        
        console.log("✅ Enhanced NFT deployed:", nftAddress);
        
        // Check remaining balance
        const balanceAfterNFT = await provider.getBalance(deployer.address);
        const remainingETH = parseFloat(ethers.formatEther(balanceAfterNFT));
        console.log("Remaining ETH:", remainingETH.toFixed(6), "ETH");
        
        if (remainingETH >= 0.002) {
            // Deploy Token Contract
            console.log("\n💰 Deploying HVNA Token...");
            const HVNAToken = await ethers.getContractFactory("HVNAToken", deployer);
            
            const token = await HVNAToken.deploy({
                gasLimit: 3000000
            });
            
            console.log("⏳ Waiting for Token deployment...");
            await token.waitForDeployment();
            const tokenAddress = await token.getAddress();
            deployedContracts.token = tokenAddress;
            
            console.log("✅ HVNA Token deployed:", tokenAddress);
        } else {
            console.log("⚠️ Insufficient ETH for token deployment");
        }
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
    }
    
    const endTime = Date.now();
    const deployTime = ((endTime - startTime) / 1000).toFixed(2);
    
    // Final results
    const finalBalance = await provider.getBalance(deployer.address);
    const finalETH = parseFloat(ethers.formatEther(finalBalance));
    const costETH = balanceETH - finalETH;
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    
    if (deployedContracts.nft) {
        console.log("✅ Enhanced NFT:", deployedContracts.nft);
    }
    if (deployedContracts.token) {
        console.log("✅ HVNA Token:", deployedContracts.token);
    }
    
    console.log("Network: Base Mainnet (8453)");
    console.log("Deployer:", deployer.address);
    console.log("Time:", deployTime, "seconds");
    console.log("Cost:", costETH.toFixed(6), "ETH");
    console.log("Remaining:", finalETH.toFixed(6), "ETH");
    
    if (deployedContracts.nft) {
        console.log("\n🔧 Widget Configuration:");
        console.log("base: {");
        console.log(`    nft: "${deployedContracts.nft}",`);
        if (deployedContracts.token) {
            console.log(`    token: "${deployedContracts.token}",`);
        }
        console.log("    chainId: 8453,");
        console.log("    rpcUrls: ['https://mainnet.base.org']");
        console.log("},");
        
        console.log("\n🎯 SUCCESS! HVNA is live on Base!");
        console.log("✅ Genesis NFT support ready");
        console.log("✅ Production deployment complete");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});