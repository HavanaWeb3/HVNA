const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Recovering tokens from old presale with wallet:", signer.address, "\n");

  const TOKEN_ADDRESS = "0xb5561D071b39221239a56F0379a6bb96C85fb94f";
  const OLD_PRESALE = "0x00e59916fEb5995E5657c68c71929B2E28E100d0";

  const tokenABI = ["function balanceOf(address) view returns (uint256)"];
  const presaleABI = [
    "function withdrawTokens(uint256 amount) external",
    "function owner() view returns (address)",
    "function hvnaToken() view returns (address)"
  ];

  const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, ethers.provider);
  const oldPresale = new ethers.Contract(OLD_PRESALE, presaleABI, signer);

  console.log("📊 CHECKING OLD PRESALE:\n");

  const owner = await oldPresale.owner();
  console.log("   Owner:", owner);
  console.log("   Your address:", signer.address);
  console.log("   You are owner:", owner.toLowerCase() === signer.address.toLowerCase());

  const tokenInContract = await oldPresale.hvnaToken();
  console.log("   Token in contract:", tokenInContract);

  const balance = await token.balanceOf(OLD_PRESALE);
  console.log("   Balance:", ethers.formatUnits(balance, 18), "HVNA");

  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.log("\n❌ You are not the owner - cannot withdraw!");
    return;
  }

  if (balance === 0n) {
    console.log("\n✅ No tokens to recover");
    return;
  }

  console.log("\n🔄 WITHDRAWING TOKENS:\n");

  try {
    const tx = await oldPresale.withdrawTokens(balance);
    console.log("   Transaction:", tx.hash);
    await tx.wait();
    console.log("   ✅ Tokens recovered!");

    const newDeployerBalance = await token.balanceOf(signer.address);
    console.log("   Your new balance:", ethers.formatUnits(newDeployerBalance, 18), "HVNA");
  } catch (error) {
    console.log("   ❌ Withdrawal failed:", error.message);

    // Check if the function exists
    console.log("\n🔍 Checking contract functions...");
    console.log("   Error suggests the function might not exist or has different parameters");
  }
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
