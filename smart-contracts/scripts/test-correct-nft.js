const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  console.log("🔍 TESTING CORRECT NFT CONTRACT:\n");

  const correctNFT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";
  const wrongNFT = "0x815D1bfaF945aCa39049FF243D6E406e2aEc3ff5";

  const nftABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)"
  ];

  const testAddress = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  console.log("Correct NFT (from .env):", correctNFT);
  try {
    const nft = new ethers.Contract(correctNFT, nftABI, ethers.provider);
    const name = await nft.name();
    const symbol = await nft.symbol();
    const balance = await nft.balanceOf(testAddress);
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Balance of", testAddress + ":", balance.toString());
    console.log("   ✅ This NFT contract works!\n");
  } catch (error) {
    console.log("   ❌ Error:", error.message, "\n");
  }

  console.log("Wrong NFT (currently in presale):", wrongNFT);
  try {
    const nft = new ethers.Contract(wrongNFT, nftABI, ethers.provider);
    const name = await nft.name();
    const symbol = await nft.symbol();
    const balance = await nft.balanceOf(testAddress);
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Balance of", testAddress + ":", balance.toString());
    console.log("   ✅ This NFT contract works!\n");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
    console.log("   ❌ This NFT contract's balanceOf() is broken!\n");
  }

  console.log("🎯 CONCLUSION:");
  console.log("   The presale contract is using the WRONG Genesis NFT address.");
  console.log("   We need to deploy a NEW presale contract with the correct NFT address.");
  console.log("   Correct NFT:", correctNFT);
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
