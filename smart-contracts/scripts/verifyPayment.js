const { ethers } = require("hardhat");

async function main() {
    console.log("💰 Genesis NFT Payment Verification");
    console.log("=".repeat(40));
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log("Usage: node verifyPayment.js <txHash> <expectedAmountETH>");
        console.log("Example: node verifyPayment.js 0x123... 2.5");
        process.exit(1);
    }
    
    const txHash = args[0];
    const expectedETH = parseFloat(args[1]);
    const ownerAddress = "0x247EC01d2fc70239b6BF0f05D26B6f11Fe32A0a5";
    
    console.log("Transaction:", txHash);
    console.log("Expected amount:", expectedETH, "ETH");
    console.log("Expected recipient:", ownerAddress);
    
    try {
        // Connect to Base
        const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
        
        // Get transaction receipt
        const tx = await provider.getTransaction(txHash);
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (!tx || !receipt) {
            console.error("❌ Transaction not found");
            process.exit(1);
        }
        
        console.log("\n📋 Transaction Details:");
        console.log("From:", tx.from);
        console.log("To:", tx.to);
        console.log("Value:", ethers.formatEther(tx.value), "ETH");
        console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
        console.log("Block:", receipt.blockNumber);
        
        // Verify payment
        const actualETH = parseFloat(ethers.formatEther(tx.value));
        const tolerance = 0.001; // Allow small discrepancy
        
        console.log("\n🔍 Payment Verification:");
        
        // Check recipient
        const correctRecipient = tx.to && tx.to.toLowerCase() === ownerAddress.toLowerCase();
        console.log("✅ Correct recipient:", correctRecipient ? "YES" : "NO");
        
        // Check amount
        const correctAmount = Math.abs(actualETH - expectedETH) <= tolerance;
        console.log("✅ Correct amount:", correctAmount ? "YES" : "NO");
        console.log("   Expected:", expectedETH, "ETH");
        console.log("   Received:", actualETH, "ETH");
        console.log("   Difference:", Math.abs(actualETH - expectedETH).toFixed(4), "ETH");
        
        // Check status
        const successful = receipt.status === 1;
        console.log("✅ Transaction successful:", successful ? "YES" : "NO");
        
        // Overall verification
        const verified = correctRecipient && correctAmount && successful;
        
        console.log("\n🎯 VERIFICATION RESULT:");
        if (verified) {
            console.log("✅ PAYMENT VERIFIED!");
            console.log("✅ Ready to transfer Genesis NFT");
            console.log("Buyer address:", tx.from);
        } else {
            console.log("❌ PAYMENT NOT VERIFIED");
            if (!correctRecipient) console.log("❌ Wrong recipient");
            if (!correctAmount) console.log("❌ Wrong amount");
            if (!successful) console.log("❌ Transaction failed");
        }
        
        // Return buyer info for transfer
        if (verified) {
            console.log("\n📝 Next Steps:");
            console.log("Run transfer command:");
            console.log(`node scripts/transferGenesis.js <tokenId> ${tx.from} ${actualETH}`);
        }
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});