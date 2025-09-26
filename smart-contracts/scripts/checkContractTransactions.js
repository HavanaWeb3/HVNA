const { ethers } = require("hardhat");

async function main() {
  // Contract address
  const contractAddress = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E";
  
  // Get provider
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  
  try {
    console.log("Checking recent transactions to contract:", contractAddress);
    
    // Get the latest block number
    const latestBlock = await provider.getBlockNumber();
    console.log("Latest block:", latestBlock);
    
    // Check the last 1000 blocks for transactions to our contract
    const fromBlock = Math.max(0, latestBlock - 1000);
    
    const filter = {
      address: contractAddress,
      fromBlock: fromBlock,
      toBlock: "latest"
    };
    
    const logs = await provider.getLogs(filter);
    
    if (logs.length === 0) {
      console.log("No transactions found to this contract in the last 1000 blocks");
      console.log("Checking if contract exists...");
      
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        console.log("❌ Contract does not exist at this address!");
      } else {
        console.log("✅ Contract exists but has no recent transactions");
      }
    } else {
      console.log(`Found ${logs.length} transactions/events:`);
      logs.forEach((log, i) => {
        console.log(`${i + 1}. Block: ${log.blockNumber}, TxHash: ${log.transactionHash}`);
      });
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });