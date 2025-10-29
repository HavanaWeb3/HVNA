const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b"
    );

    // From deployment files
    const WEBSITE_PRESALE = "0x2cCE8fA9C5A369145319EB4906a47B319c639928"; // Vesting V3
    const DEPLOYER_OWNER = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
    const HVNA_TOKEN = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";

    console.log("=".repeat(80));
    console.log("HVNA PRESALE - COMPLETE STATUS REPORT");
    console.log("=".repeat(80));
    console.log();

    // Check deployer/owner ETH balance
    console.log("OWNER WALLET:");
    console.log("-".repeat(80));
    console.log(`Address: ${DEPLOYER_OWNER}`);
    const ownerBalance = await provider.getBalance(DEPLOYER_OWNER);
    console.log(`ETH Balance: ${ethers.formatEther(ownerBalance)} ETH`);
    console.log();

    // Check presale contract
    console.log("PRESALE CONTRACT (on www.havanaelephant.com):");
    console.log("-".repeat(80));
    console.log(`Address: ${WEBSITE_PRESALE}`);
    const presaleBalance = await provider.getBalance(WEBSITE_PRESALE);
    console.log(`ETH Balance: ${ethers.formatEther(presaleBalance)} ETH`);

    // Check if contract has code
    const code = await provider.getCode(WEBSITE_PRESALE);
    console.log(`Contract Status: ${code !== "0x" ? "✅ Deployed" : "❌ Not deployed"}`);
    console.log();

    // Try to get transaction count
    console.log("TRANSACTION ANALYSIS:");
    console.log("-".repeat(80));
    const txCount = await provider.getTransactionCount(WEBSITE_PRESALE);
    console.log(`Transactions sent FROM contract: ${txCount}`);

    // Get recent blocks to check for incoming transactions
    try {
        const currentBlock = await provider.getBlockNumber();
        console.log(`Current block: ${currentBlock}`);

        // Check last 1000 blocks for any transfers TO the contract
        const fromBlock = Math.max(0, currentBlock - 1000);

        // Check for incoming ETH transfers
        console.log(`\nChecking blocks ${fromBlock} to ${currentBlock} for activity...`);

        let incomingTxCount = 0;
        let totalETHReceived = BigInt(0);

        // We'll sample every 100 blocks to avoid rate limits
        for (let i = currentBlock; i >= fromBlock && i >= currentBlock - 1000; i -= 100) {
            try {
                const block = await provider.getBlock(i, true);
                if (block && block.transactions) {
                    for (const tx of block.transactions) {
                        if (tx.to && tx.to.toLowerCase() === WEBSITE_PRESALE.toLowerCase()) {
                            incomingTxCount++;
                            totalETHReceived += tx.value;
                        }
                    }
                }
            } catch (e) {
                // Skip errors on individual blocks
            }
        }

        console.log(`Incoming transactions found (sampled): ${incomingTxCount}`);
        console.log(`Total ETH received (sampled): ${ethers.formatEther(totalETHReceived)} ETH`);

    } catch (e) {
        console.log(`Could not analyze transactions: ${e.message}`);
    }

    console.log();

    // Check token balances
    console.log("TOKEN BALANCES:");
    console.log("-".repeat(80));
    const tokenABI = ["function balanceOf(address) view returns (uint256)"];
    const hvnaToken = new ethers.Contract(HVNA_TOKEN, tokenABI, provider);

    const contractTokens = await hvnaToken.balanceOf(WEBSITE_PRESALE);
    const ownerTokens = await hvnaToken.balanceOf(DEPLOYER_OWNER);

    console.log(`HVNA in Presale Contract: ${ethers.formatEther(contractTokens)} HVNA`);
    console.log(`HVNA in Owner Wallet: ${ethers.formatEther(ownerTokens)} HVNA`);
    console.log();

    console.log("=".repeat(80));
    console.log("SUMMARY:");
    console.log("-".repeat(80));
    console.log(`
The presale contract on www.havanaelephant.com is:
  ${WEBSITE_PRESALE}

Current Status:
  - Contract ETH Balance: ${ethers.formatEther(presaleBalance)} ETH
  - Owner ETH Balance: ${ethers.formatEther(ownerBalance)} ETH
  - Contract HVNA Balance: ${ethers.formatEther(contractTokens)} HVNA

If the contract has 0 ETH but has received transactions, it likely uses
auto-forwarding to send ETH directly to the owner's wallet.

To see full transaction history, visit:
  https://basescan.org/address/${WEBSITE_PRESALE}
    `);
    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
