const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider(
        "https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b"
    );

    const contracts = {
        "Website Presale (Vesting V3)": "0x2cCE8fA9C5A369145319EB4906a47B319c639928",
        "AutoForward Presale": "0x90EB45B474Cf6f6449F553796464262ecCAC1023",
        "TokenPreSaleFixed": "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E",
        "Old Presale": "0x00e59916fEb5995E5657c68c71929B2E28E100d0"
    };

    console.log("=".repeat(80));
    console.log("CONTRACT VERIFICATION");
    console.log("=".repeat(80));
    console.log();

    for (const [name, address] of Object.entries(contracts)) {
        console.log(`${name}:`);
        console.log(`  Address: ${address}`);

        const code = await provider.getCode(address);
        const balance = await provider.getBalance(address);

        if (code === "0x") {
            console.log(`  Status: ❌ NO CONTRACT (not deployed or destroyed)`);
        } else {
            console.log(`  Status: ✅ Contract exists`);
            console.log(`  Bytecode length: ${code.length} characters`);
        }

        console.log(`  ETH Balance: ${ethers.formatEther(balance)} ETH`);
        console.log();
    }

    console.log("=".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
