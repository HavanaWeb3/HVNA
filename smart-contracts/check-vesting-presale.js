const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b"
    );

    const VESTING_PRESALE = "0x2cCE8fA9C5A369145319EB4906a47B319c639928";
    const OWNER = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
    const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";

    console.log("=".repeat(80));
    console.log("VESTING PRESALE CONTRACT - COMPLETE STATUS");
    console.log("=".repeat(80));
    console.log();

    const presaleABI = [
        "function owner() view returns (address)",
        "function saleActive() view returns (bool)",
        "function currentPhase() view returns (uint8)",
        "function tokensSold() view returns (uint256)",
        "function maxTokensForPreSale() view returns (uint256)",
        "function vestingEnabled() view returns (bool)",
        "function vestingStartDate() view returns (uint256)",
        "function tokenPriceUSDCents() view returns (uint256)",
        "function genesisDiscountPercent() view returns (uint256)",
        "function minPurchase() view returns (uint256)",
        "function maxPurchaseGenesis() view returns (uint256)",
        "function maxPurchasePublic() view returns (uint256)",
        "function getETHUSDPrice() view returns (uint256)",
        "function getPurchasedTokens(address) view returns (uint256)",
        "function getClaimableTokens(address) view returns (uint256)",
        "function getUnclaimedTokens(address) view returns (uint256)"
    ];

    const tokenABI = ["function balanceOf(address) view returns (uint256)"];

    try {
        const presale = new ethers.Contract(VESTING_PRESALE, presaleABI, provider);
        const hvnaToken = new ethers.Contract(HVNA_TOKEN, tokenABI, provider);

        // Basic info
        console.log("CONTRACT INFO:");
        console.log("-".repeat(80));
        console.log(`Address: ${VESTING_PRESALE}`);

        const owner = await presale.owner();
        const saleActive = await presale.saleActive();
        const currentPhase = await presale.currentPhase();
        const vestingEnabled = await presale.vestingEnabled();

        console.log(`Owner: ${owner}`);
        console.log(`Sale Active: ${saleActive}`);
        console.log(`Current Phase: ${currentPhase === 0 ? 'GENESIS' : currentPhase === 1 ? 'PUBLIC' : 'ENDED'}`);
        console.log(`Vesting Enabled: ${vestingEnabled}`);

        if (vestingEnabled) {
            const vestingStartDate = await presale.vestingStartDate();
            const date = new Date(Number(vestingStartDate) * 1000);
            console.log(`Vesting Start Date: ${date.toISOString()}`);
        }
        console.log();

        // Sales stats
        console.log("SALES STATISTICS:");
        console.log("-".repeat(80));
        const tokensSold = await presale.tokensSold();
        const maxTokens = await presale.maxTokensForPreSale();

        console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} HVNA`);
        console.log(`Max Tokens: ${ethers.formatEther(maxTokens)} HVNA`);
        console.log(`Remaining: ${ethers.formatEther(maxTokens - tokensSold)} HVNA`);
        console.log(`Sales Progress: ${((Number(tokensSold) / Number(maxTokens)) * 100).toFixed(2)}%`);
        console.log();

        // Pricing
        console.log("PRICING:");
        console.log("-".repeat(80));
        const tokenPrice = await presale.tokenPriceUSDCents();
        const genesisDiscount = await presale.genesisDiscountPercent();
        const ethUSDPrice = await presale.getETHUSDPrice();

        const publicPriceUSD = Number(tokenPrice) / 100;
        const genesisPriceUSD = publicPriceUSD * (1 - Number(genesisDiscount) / 100);

        console.log(`ETH/USD Price: $${(Number(ethUSDPrice) / 1e8).toFixed(2)} (from Chainlink)`);
        console.log(`Token Price (Public): $${publicPriceUSD.toFixed(4)} per token`);
        console.log(`Token Price (Genesis): $${genesisPriceUSD.toFixed(4)} per token (${genesisDiscount}% discount)`);
        console.log();

        // Purchase limits
        console.log("PURCHASE LIMITS:");
        console.log("-".repeat(80));
        const minPurchase = await presale.minPurchase();
        const maxGenesis = await presale.maxPurchaseGenesis();
        const maxPublic = await presale.maxPurchasePublic();

        console.log(`Minimum: ${ethers.formatEther(minPurchase)} HVNA (~$${(Number(ethers.formatEther(minPurchase)) * publicPriceUSD).toFixed(2)})`);
        console.log(`Maximum (Genesis): ${ethers.formatEther(maxGenesis)} HVNA (~$${(Number(ethers.formatEther(maxGenesis)) * genesisPriceUSD).toFixed(2)})`);
        console.log(`Maximum (Public): ${ethers.formatEther(maxPublic)} HVNA (~$${(Number(ethers.formatEther(maxPublic)) * publicPriceUSD).toFixed(2)})`);
        console.log();

        // Balances
        console.log("BALANCES:");
        console.log("-".repeat(80));
        const contractETH = await provider.getBalance(VESTING_PRESALE);
        const contractTokens = await hvnaToken.balanceOf(VESTING_PRESALE);
        const ownerETH = await provider.getBalance(OWNER);
        const ownerTokens = await hvnaToken.balanceOf(OWNER);

        console.log(`Contract ETH: ${ethers.formatEther(contractETH)} ETH`);
        console.log(`Contract HVNA: ${ethers.formatEther(contractTokens)} HVNA`);
        console.log(`Owner ETH: ${ethers.formatEther(ownerETH)} ETH`);
        console.log(`Owner HVNA: ${ethers.formatEther(ownerTokens)} HVNA`);
        console.log();

        // Sample purchase check (owner wallet)
        console.log("OWNER PURCHASE STATUS:");
        console.log("-".repeat(80));
        try {
            const purchased = await presale.getPurchasedTokens(OWNER);
            const claimable = await presale.getClaimableTokens(OWNER);
            const unclaimed = await presale.getUnclaimedTokens(OWNER);

            console.log(`Purchased: ${ethers.formatEther(purchased)} HVNA`);
            console.log(`Claimable Now: ${ethers.formatEther(claimable)} HVNA`);
            console.log(`Unclaimed Total: ${ethers.formatEther(unclaimed)} HVNA`);
        } catch (e) {
            console.log(`No purchases by owner wallet`);
        }
        console.log();

        console.log("=".repeat(80));
        console.log("SUMMARY:");
        console.log("-".repeat(80));

        if (Number(tokensSold) > 0) {
            const totalSalesUSD = Number(ethers.formatEther(tokensSold)) * publicPriceUSD;
            console.log(`✅ ${ethers.formatEther(tokensSold)} HVNA tokens have been sold`);
            console.log(`💰 Estimated value: ~$${totalSalesUSD.toFixed(2)} USD`);
            console.log(`💵 ETH in contract: ${ethers.formatEther(contractETH)} ETH`);
            console.log(`💵 ETH in owner wallet: ${ethers.formatEther(ownerETH)} ETH`);
        } else {
            console.log(`⚠️  No tokens sold yet`);
            console.log(`Sale Active: ${saleActive}`);
            console.log(`Phase: ${currentPhase === 0 ? 'GENESIS' : currentPhase === 1 ? 'PUBLIC' : 'ENDED'}`);
        }

        console.log();
        console.log("View on Basescan:");
        console.log(`https://basescan.org/address/${VESTING_PRESALE}`);
        console.log("=".repeat(80));

    } catch (error) {
        console.error("Error:", error.message);
        console.error("\nThis might be because:");
        console.error("1. The contract doesn't have these functions");
        console.error("2. The contract is not the vesting version");
        console.error("3. Network connection issue");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
