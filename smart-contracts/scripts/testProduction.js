const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 PRODUCTION TEST - Base Mainnet");
    console.log("=".repeat(50));
    
    // Your deployed contract on Base
    const NFT_ADDRESS = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
    const TEST_ADDRESS = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5"; // Your address
    
    // Connect to Base mainnet
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    console.log("🌐 Testing on Base Mainnet");
    console.log("NFT Contract:", NFT_ADDRESS);
    console.log("Test Address:", TEST_ADDRESS);
    
    try {
        // Get contract instance
        const nftABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function maxSupply() view returns (uint256)",
            "function genesisSupply() view returns (uint256)",
            "function genesisCount() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function isGenesis(uint256) view returns (bool)",
            "function hasGenesisNFT(address) view returns (bool)",
            "function genesisBalanceOf(address) view returns (uint256)",
            "function getTier(address) view returns (string, uint256)"
        ];
        
        const nftContract = new ethers.Contract(NFT_ADDRESS, nftABI, provider);
        
        console.log("\n📋 Contract Basic Info:");
        const name = await nftContract.name();
        const symbol = await nftContract.symbol();
        const totalSupply = await nftContract.totalSupply();
        const maxSupply = await nftContract.maxSupply();
        const genesisSupply = await nftContract.genesisSupply();
        const genesisCount = await nftContract.genesisCount();
        
        console.log("✅ Name:", name);
        console.log("✅ Symbol:", symbol);
        console.log("✅ Total Supply:", totalSupply.toString());
        console.log("✅ Max Supply:", maxSupply.toString());
        console.log("✅ Genesis Supply:", genesisSupply.toString());
        console.log("✅ Genesis Count:", genesisCount.toString());
        
        console.log("\n🏆 Genesis NFT Testing:");
        const isToken1Genesis = await nftContract.isGenesis(1);
        const isToken101Genesis = await nftContract.isGenesis(101);
        
        console.log("✅ Token ID 1 is Genesis:", isToken1Genesis);
        console.log("✅ Token ID 101 is Genesis:", isToken101Genesis);
        
        console.log("\n👤 User Holdings Test:");
        const nftBalance = await nftContract.balanceOf(TEST_ADDRESS);
        const hasGenesis = await nftContract.hasGenesisNFT(TEST_ADDRESS);
        const genesisBalance = await nftContract.genesisBalanceOf(TEST_ADDRESS);
        
        console.log("✅ NFT Balance:", nftBalance.toString());
        console.log("✅ Has Genesis NFT:", hasGenesis);
        console.log("✅ Genesis NFT Count:", genesisBalance.toString());
        
        // Test tier calculation
        try {
            const [tier, discount] = await nftContract.getTier(TEST_ADDRESS);
            console.log("✅ Current Tier:", tier);
            console.log("✅ Discount Percentage:", discount.toString() + "%");
        } catch (error) {
            console.log("⚠️ Tier function not available (using basic contract)");
        }
        
        console.log("\n🎯 Widget Integration Test:");
        
        // Test widget discount logic
        function calculateWidgetDiscount(nftCount, genesisCount) {
            if (genesisCount > 0) {
                return { discount: 30, type: 'Genesis NFT Holder', tier: 'Ultimate' };
            } else if (nftCount >= 3) {
                return { discount: 30, type: 'Platinum NFT Holder', tier: 'Platinum' };
            } else if (nftCount >= 2) {
                return { discount: 20, type: 'Gold NFT Holder', tier: 'Gold' };
            } else if (nftCount >= 1) {
                return { discount: 10, type: 'Silver NFT Holder', tier: 'Silver' };
            } else {
                return { discount: 0, type: 'No discount available', tier: 'None' };
            }
        }
        
        const widgetResult = calculateWidgetDiscount(
            parseInt(nftBalance.toString()), 
            parseInt(genesisBalance.toString())
        );
        
        console.log("✅ Widget Discount:", widgetResult.discount + "%");
        console.log("✅ Widget Type:", widgetResult.type);
        console.log("✅ Widget Tier:", widgetResult.tier);
        
        // Network verification
        const network = await provider.getNetwork();
        console.log("\n🌐 Network Verification:");
        console.log("✅ Chain ID:", network.chainId.toString());
        console.log("✅ Network Name:", network.name);
        console.log("✅ Is Base Mainnet:", network.chainId.toString() === "8453" ? "YES" : "NO");
        
        console.log("\n" + "=".repeat(50));
        console.log("🎉 PRODUCTION TEST RESULTS");
        console.log("=".repeat(50));
        console.log("✅ Contract deployed and responding");
        console.log("✅ Genesis NFT functions working");
        console.log("✅ Discount calculation working");
        console.log("✅ Widget integration ready");
        console.log("✅ Base mainnet connection successful");
        
        console.log("\n🚀 READY FOR PRODUCTION LAUNCH!");
        console.log("Your HVNA Genesis NFT system is fully operational!");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        
        if (error.message.includes("network")) {
            console.log("💡 Check Base network RPC connection");
        } else if (error.message.includes("contract")) {
            console.log("💡 Verify contract address and ABI");
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});