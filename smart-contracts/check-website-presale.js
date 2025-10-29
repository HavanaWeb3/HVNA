const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b"
    );

    // Contract address from the website
    const WEBSITE_PRESALE = "0x2cCE8fA9C5A369145319EB4906a47B319c639928";
    const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";

    console.log("=".repeat(80));
    console.log("WEBSITE PRESALE CONTRACT STATUS");
    console.log("=".repeat(80));
    console.log(`Contract: ${WEBSITE_PRESALE}`);
    console.log();

    // Check ETH balance
    const ethBalance = await provider.getBalance(WEBSITE_PRESALE);
    console.log(`ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);
    console.log();

    // ABI for presale contract
    const presaleABI = [
        "function tokensSold() view returns (uint256)",
        "function maxTokensForPreSale() view returns (uint256)",
        "function currentPhase() view returns (uint8)",
        "function saleActive() view returns (bool)",
        "function ethPriceUSD() view returns (uint256)",
        "function genesisPriceUSDCents() view returns (uint256)",
        "function publicPriceUSDCents() view returns (uint256)",
        "function getContractBalance() view returns (uint256)",
        "function getRemainingTokens() view returns (uint256)",
        "function owner() view returns (address)",
        "function minPurchase() view returns (uint256)",
        "function maxPurchaseGenesis() view returns (uint256)",
        "function maxPurchasePublic() view returns (uint256)"
    ];

    const tokenABI = [
        "function balanceOf(address) view returns (uint256)"
    ];

    try {
        const presale = new ethers.Contract(WEBSITE_PRESALE, presaleABI, provider);
        const hvnaToken = new ethers.Contract(HVNA_TOKEN, tokenABI, provider);

        console.log("CONTRACT DETAILS:");
        console.log("-".repeat(80));

        const owner = await presale.owner();
        const tokensSold = await presale.tokensSold();
        const maxTokens = await presale.maxTokensForPreSale();
        const currentPhase = await presale.currentPhase();
        const saleActive = await presale.saleActive();
        const remaining = await presale.getRemainingTokens();
        const contractTokenBalance = await hvnaToken.balanceOf(WEBSITE_PRESALE);

        console.log(`Owner: ${owner}`);
        console.log(`Sale Active: ${saleActive}`);
        console.log(`Current Phase: ${currentPhase === 0 ? 'GENESIS' : currentPhase === 1 ? 'PUBLIC' : 'ENDED'}`);
        console.log();

        console.log("PRICING:");
        console.log("-".repeat(80));
        try {
            const ethPrice = await presale.ethPriceUSD();
            const genesisPrice = await presale.genesisPriceUSDCents();
            const publicPrice = await presale.publicPriceUSDCents();
            console.log(`ETH Price: $${ethPrice.toString()}`);
            console.log(`Genesis Price: $${Number(genesisPrice)/100} per 1000 tokens`);
            console.log(`Public Price: $${Number(publicPrice)/100} per 1000 tokens`);
        } catch (e) {
            console.log("Pricing info not available on this contract");
        }
        console.log();

        console.log("TOKENS:");
        console.log("-".repeat(80));
        console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} HVNA`);
        console.log(`Max Tokens: ${ethers.formatEther(maxTokens)} HVNA`);
        console.log(`Remaining: ${ethers.formatEther(remaining)} HVNA`);
        console.log(`Token Balance in Contract: ${ethers.formatEther(contractTokenBalance)} HVNA`);
        console.log();

        console.log("PURCHASE LIMITS:");
        console.log("-".repeat(80));
        try {
            const minPurchase = await presale.minPurchase();
            const maxGenesis = await presale.maxPurchaseGenesis();
            const maxPublic = await presale.maxPurchasePublic();
            console.log(`Minimum Purchase: ${ethers.formatEther(minPurchase)} HVNA`);
            console.log(`Max Purchase (Genesis): ${ethers.formatEther(maxGenesis)} HVNA`);
            console.log(`Max Purchase (Public): ${ethers.formatEther(maxPublic)} HVNA`);
        } catch (e) {
            console.log("Purchase limit info not available");
        }
        console.log();

        // Check owner's ETH balance
        console.log("OWNER WALLET:");
        console.log("-".repeat(80));
        const ownerBalance = await provider.getBalance(owner);
        console.log(`Owner Address: ${owner}`);
        console.log(`Owner ETH Balance: ${ethers.formatEther(ownerBalance)} ETH`);
        console.log();

        // Check for any purchase events
        console.log("CHECKING FOR RECENT PURCHASES...");
        console.log("-".repeat(80));
        try {
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks

            // TokensPurchased event signature
            const filter = {
                address: WEBSITE_PRESALE,
                fromBlock: fromBlock,
                toBlock: 'latest'
            };

            const logs = await provider.getLogs(filter);
            console.log(`Found ${logs.length} events in the last 10,000 blocks`);

            if (logs.length > 0) {
                console.log("\nRecent activity detected!");
                console.log(`Block range: ${fromBlock} to ${currentBlock}`);
            } else {
                console.log("No recent purchase activity detected");
            }
        } catch (e) {
            console.log(`Could not fetch events: ${e.message}`);
        }

    } catch (error) {
        console.log(`Error: ${error.message}`);
    }

    console.log();
    console.log("=".repeat(80));
    console.log("SUMMARY:");
    console.log("-".repeat(80));
    console.log("This is the presale contract currently used on www.havanaelephant.com");
    console.log("Check the contract's ETH balance to see if purchases are accumulating.");
    console.log("If using AutoForward, ETH goes directly to owner's wallet.");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
