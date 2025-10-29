const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b"
    );

    // Contract addresses from deployment files
    const contracts = {
        "newPresale (AutoForward)": "0x90EB45B474Cf6f6449F553796464262ecCAC1023",
        "tokenPreSaleFixed": "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E",
        "oldPresale": "0x00e59916fEb5995E5657c68c71929B2E28E100d0",
        "hvnaToken": "0xb5561D071b39221239a56F0379a6bb96C85fb94f"
    };

    console.log("=".repeat(80));
    console.log("PRESALE CONTRACT STATUS CHECK");
    console.log("=".repeat(80));
    console.log();

    // Check ETH balances
    console.log("ETH BALANCES:");
    console.log("-".repeat(80));
    for (const [name, address] of Object.entries(contracts)) {
        const balance = await provider.getBalance(address);
        const ethBalance = ethers.formatEther(balance);
        console.log(`${name}:`);
        console.log(`  Address: ${address}`);
        console.log(`  ETH Balance: ${ethBalance} ETH`);
        console.log();
    }

    // ABI for presale contract (minimal needed functions)
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
        "function owner() view returns (address)"
    ];

    const tokenABI = [
        "function balanceOf(address) view returns (uint256)",
        "function totalSupply() view returns (uint256)"
    ];

    console.log("=".repeat(80));
    console.log("PRESALE CONTRACT DETAILS:");
    console.log("-".repeat(80));

    // Check new presale (AutoForward)
    try {
        const newPresale = new ethers.Contract(
            contracts["newPresale (AutoForward)"],
            presaleABI,
            provider
        );

        console.log("\n1. NEW PRESALE (AutoForward) - 0x90EB45B474Cf6f6449F553796464262ecCAC1023");
        console.log("-".repeat(80));

        const owner = await newPresale.owner();
        const tokensSold = await newPresale.tokensSold();
        const maxTokens = await newPresale.maxTokensForPreSale();
        const currentPhase = await newPresale.currentPhase();
        const saleActive = await newPresale.saleActive();
        const ethPrice = await newPresale.ethPriceUSD();
        const genesisPrice = await newPresale.genesisPriceUSDCents();
        const publicPrice = await newPresale.publicPriceUSDCents();
        const remaining = await newPresale.getRemainingTokens();

        console.log(`Owner: ${owner}`);
        console.log(`Sale Active: ${saleActive}`);
        console.log(`Current Phase: ${currentPhase === 0 ? 'GENESIS' : currentPhase === 1 ? 'PUBLIC' : 'ENDED'}`);
        console.log(`ETH Price: $${ethPrice.toString()}`);
        console.log(`Genesis Price: $${Number(genesisPrice)/100} per 1000 tokens`);
        console.log(`Public Price: $${Number(publicPrice)/100} per 1000 tokens`);
        console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} HVNA`);
        console.log(`Max Tokens: ${ethers.formatEther(maxTokens)} HVNA`);
        console.log(`Remaining: ${ethers.formatEther(remaining)} HVNA`);

        // Check token balance in contract
        const hvnaToken = new ethers.Contract(contracts.hvnaToken, tokenABI, provider);
        const contractTokenBalance = await hvnaToken.balanceOf(contracts["newPresale (AutoForward)"]);
        console.log(`Token Balance in Contract: ${ethers.formatEther(contractTokenBalance)} HVNA`);

    } catch (error) {
        console.log(`Error checking newPresale: ${error.message}`);
    }

    // Check tokenPreSaleFixed
    try {
        const fixedPresale = new ethers.Contract(
            contracts["tokenPreSaleFixed"],
            presaleABI,
            provider
        );

        console.log("\n2. TOKEN PRESALE FIXED - 0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E");
        console.log("-".repeat(80));

        const owner = await fixedPresale.owner();
        const tokensSold = await fixedPresale.tokensSold();
        const maxTokens = await fixedPresale.maxTokensForPreSale();
        const currentPhase = await fixedPresale.currentPhase();
        const saleActive = await fixedPresale.saleActive();
        const ethPrice = await fixedPresale.ethPriceUSD();
        const genesisPrice = await fixedPresale.genesisPriceUSDCents();
        const publicPrice = await fixedPresale.publicPriceUSDCents();
        const remaining = await fixedPresale.getRemainingTokens();

        console.log(`Owner: ${owner}`);
        console.log(`Sale Active: ${saleActive}`);
        console.log(`Current Phase: ${currentPhase === 0 ? 'GENESIS' : currentPhase === 1 ? 'PUBLIC' : 'ENDED'}`);
        console.log(`ETH Price: $${ethPrice.toString()}`);
        console.log(`Genesis Price: $${Number(genesisPrice)/100} per 1000 tokens`);
        console.log(`Public Price: $${Number(publicPrice)/100} per 1000 tokens`);
        console.log(`Tokens Sold: ${ethers.formatEther(tokensSold)} HVNA`);
        console.log(`Max Tokens: ${ethers.formatEther(maxTokens)} HVNA`);
        console.log(`Remaining: ${ethers.formatEther(remaining)} HVNA`);

        // Check token balance in contract
        const hvnaToken = new ethers.Contract(contracts.hvnaToken, tokenABI, provider);
        const contractTokenBalance = await hvnaToken.balanceOf(contracts["tokenPreSaleFixed"]);
        console.log(`Token Balance in Contract: ${ethers.formatEther(contractTokenBalance)} HVNA`);

    } catch (error) {
        console.log(`Error checking fixedPresale: ${error.message}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("SUMMARY:");
    console.log("-".repeat(80));
    console.log("\nNote: The AutoForward contract automatically forwards ETH to the owner,");
    console.log("so its ETH balance should remain near zero. Check the owner's wallet for funds.");
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
