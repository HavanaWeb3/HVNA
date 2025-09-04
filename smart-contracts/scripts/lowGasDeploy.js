const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Low Gas Deployment to Base - Using Available ETH");
    console.log("=".repeat(50));
    
    // Use the address that actually has the ETH
    const deployerPrivateKey = process.env.PRIVATE_KEY;
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const deployer = new ethers.Wallet(deployerPrivateKey, provider);
    
    console.log("Deployer address:", deployer.address);
    
    const balance = await provider.getBalance(deployer.address);
    const balanceETH = parseFloat(ethers.formatEther(balance));
    console.log("Available ETH:", balanceETH.toFixed(6), "ETH");
    
    if (balanceETH < 0.003) {
        console.error("❌ Insufficient balance for any deployment");
        console.log("Available:", balanceETH.toFixed(6), "ETH");
        console.log("Need at least: 0.003 ETH");
        process.exit(1);
    }
    
    // Get conservative gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log("Gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
    
    let deployedContracts = {};
    
    try {
        // Deploy NFT Contract with gas limit
        console.log("\n🎨 Deploying Enhanced NFT Contract...");
        const BoldlyElephunkyNFTEnhanced = await ethers.getContractFactory("BoldlyElephunkyNFTEnhanced", deployer);
        
        const nftEstimate = await BoldlyElephunkyNFTEnhanced.getDeployTransaction().estimateGas;
        console.log("Estimated gas for NFT:", nftEstimate?.toString() || "unknown");
        
        const nftEnhanced = await BoldlyElephunkyNFTEnhanced.deploy({
            gasLimit: 2500000, // Conservative limit
            gasPrice: gasPrice
        });
        
        await nftEnhanced.waitForDeployment();
        const nftAddress = await nftEnhanced.getAddress();
        deployedContracts.nft = nftAddress;
        
        console.log("✅ Enhanced NFT deployed:", nftAddress);
        
        // Check remaining balance
        const balanceAfterNFT = await provider.getBalance(deployer.address);
        const remainingETH = parseFloat(ethers.formatEther(balanceAfterNFT));
        console.log("Remaining ETH after NFT:", remainingETH.toFixed(6), "ETH");
        
        if (remainingETH < 0.002) {
            console.log("⚠️ Low ETH remaining, skipping token deployment");
            console.log("NFT contract deployed successfully!");
            console.log("You can deploy token contract separately later");
        } else {
            // Try to deploy token
            console.log("\n💰 Deploying HVNA Token...");
            const HVNAToken = await ethers.getContractFactory("HVNAToken", deployer);
            
            const token = await HVNAToken.deploy({
                gasLimit: 2000000,
                gasPrice: gasPrice
            });
            
            await token.waitForDeployment();
            const tokenAddress = await token.getAddress();
            deployedContracts.token = tokenAddress;
            
            console.log("✅ HVNA Token deployed:", tokenAddress);
        }
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Solutions:");
            console.log("1. Try deploying just one contract at a time");
            console.log("2. Bridge more ETH to this address");
            console.log("3. Transfer ETH from your other Base addresses");
        }
        
        // Still show what we deployed successfully
        if (deployedContracts.nft) {
            console.log("\n✅ Partial Success:");
            console.log("NFT contract deployed:", deployedContracts.nft);
        }
    }
    
    // Final status
    const finalBalance = await provider.getBalance(deployer.address);
    const finalETH = parseFloat(ethers.formatEther(finalBalance));
    
    console.log("\n" + "=".repeat(50));
    console.log("🏁 DEPLOYMENT RESULTS");
    console.log("=".repeat(50));
    console.log("Final ETH balance:", finalETH.toFixed(6), "ETH");
    
    if (deployedContracts.nft) {
        console.log("✅ NFT Contract:", deployedContracts.nft);
    }
    if (deployedContracts.token) {
        console.log("✅ Token Contract:", deployedContracts.token);
    }
    
    if (deployedContracts.nft || deployedContracts.token) {
        console.log("\n🎯 SUCCESS! At least one contract deployed!");
        console.log("🔧 Update your widget with these addresses");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});