const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const contracts = {
    "V3 (Current)": "0x2cCE8fA9C5A369145319EB4906a47B319c639928",
    "V2": "0x746c20b76d5B0E3CBA8C317599BEd1D71b318d5B",
    "Old Fixed": "0x90EB45B474Cf6f6449F553796464262ecCAC1023"
  };

  console.log(`\n=== Presale Contract ETH Balances ===\n`);

  for (const [name, address] of Object.entries(contracts)) {
    const balance = await ethers.provider.getBalance(address);
    const balanceETH = ethers.formatEther(balance);
    console.log(`${name}:`);
    console.log(`  Address: ${address}`);
    console.log(`  Balance: ${balanceETH} ETH\n`);
  }
}

main().catch(console.error);
