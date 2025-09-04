const { ethers } = require("hardhat");

async function main() {
    console.log("🏭 Minting Remaining Genesis NFTs");
    console.log("=".repeat(40));
    
    // Your deployed contract and private key
    const NFT_ADDRESS = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    const yourPrivateKey = "291e79fdbc0f90e9483058041074be50d560087ca3b28e4bdbb596e5c25c36ce";
    
    // Connect to Base
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const deployer = new ethers.Wallet(yourPrivateKey, provider);
    
    console.log("Contract:", NFT_ADDRESS);
    console.log("Deployer:", deployer.address);
    
    // Check balance
    const balance = await provider.getBalance(deployer.address);
    const balanceETH = parseFloat(ethers.formatEther(balance));
    console.log("ETH Balance:", balanceETH.toFixed(6), "ETH");
    
    if (balanceETH < 0.002) {
        console.error("❌ Insufficient ETH for minting");
        process.exit(1);
    }
    
    try {
        // Get contract instance
        const nftABI = [
            "function name() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function genesisCount() view returns (uint256)",
            "function genesisSupply() view returns (uint256)",
            "function ownerMintGenesis(address to, uint256 amount) external",
            "function owner() view returns (address)"
        ];
        
        const nftContract = new ethers.Contract(NFT_ADDRESS, nftABI, deployer);
        
        // Check current status
        console.log("\n📋 Current Status:");
        const name = await nftContract.name();
        const totalSupply = await nftContract.totalSupply();
        const genesisCount = await nftContract.genesisCount();
        const genesisSupply = await nftContract.genesisSupply();
        const owner = await nftContract.owner();
        
        console.log("✅ Contract Name:", name);
        console.log("✅ Total Supply:", totalSupply.toString());
        console.log("✅ Genesis Count:", genesisCount.toString(), "/ 100");
        console.log("✅ Genesis Supply:", genesisSupply.toString());
        console.log("✅ Contract Owner:", owner);
        console.log("✅ Your Address:", deployer.address);
        console.log("✅ You are owner:", owner.toLowerCase() === deployer.address.toLowerCase());
        
        // Calculate how many to mint
        const currentGenesis = parseInt(genesisCount.toString());
        const targetGenesis = 100;
        const alreadyHave = 65; // You mentioned 65 on OpenSea
        const needToMint = targetGenesis - currentGenesis;
        
        console.log("\n🧮 Minting Calculation:");
        console.log("Genesis on contract:", currentGenesis);
        console.log("Genesis on OpenSea:", alreadyHave);
        console.log("Target total:", targetGenesis);
        console.log("Need to mint:", needToMint);
        
        if (needToMint <= 0) {
            console.log("✅ All Genesis NFTs already minted!");
            return;
        }
        
        if (needToMint > 50) {
            console.log("⚠️ Need to mint", needToMint, "- this might be expensive");
            console.log("💡 Consider minting in batches");
        }
        
        // Owner check
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.error("❌ You are not the contract owner");
            console.log("Contract owner:", owner);
            console.log("Your address:", deployer.address);
            process.exit(1);
        }
        
        // Mint the remaining Genesis NFTs
        console.log(`\n🏭 Minting ${needToMint} Genesis NFTs...`);
        
        const mintTx = await nftContract.ownerMintGenesis(deployer.address, needToMint, {
            gasLimit: 5000000 // High gas limit for bulk minting
        });
        
        console.log("⏳ Transaction submitted:", mintTx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await mintTx.wait();
        console.log("✅ Transaction confirmed!");
        
        // Check final status
        const finalGenesisCount = await nftContract.genesisCount();
        const finalTotalSupply = await nftContract.totalSupply();
        
        console.log("\n🎉 MINTING COMPLETE!");
        console.log("=".repeat(40));
        console.log("✅ Final Genesis Count:", finalGenesisCount.toString());
        console.log("✅ Final Total Supply:", finalTotalSupply.toString());
        console.log("✅ Gas used:", receipt.gasUsed.toString());
        console.log("✅ All 100 Genesis NFTs ready!");
        
        console.log("\n🔗 View on BaseScan:");
        console.log(`https://basescan.org/tx/${mintTx.hash}`);
        
    } catch (error) {
        console.error("❌ Minting failed:", error.message);
        
        if (error.message.includes("owner")) {
            console.log("💡 Only the contract owner can mint Genesis NFTs");
        } else if (error.message.includes("Genesis")) {
            console.log("💡 Check Genesis supply limits");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});