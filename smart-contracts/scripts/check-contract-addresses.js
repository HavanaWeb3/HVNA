const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const presaleABI = [
    "function hvnaToken() view returns (address)",
    "function genesisNFT() view returns (address)",
    "function priceFeed() view returns (address)",
    "function owner() view returns (address)"
  ];

  const presale = new ethers.Contract("0x00e59916fEb5995E5657c68c71929B2E28E100d0", presaleABI, ethers.provider);

  console.log("📍 CONTRACT ADDRESSES:\n");

  const tokenAddress = await presale.hvnaToken();
  console.log("   HVNA Token:", tokenAddress);

  const nftAddress = await presale.genesisNFT();
  console.log("   Genesis NFT:", nftAddress);

  const priceFeedAddress = await presale.priceFeed();
  console.log("   Price Feed:", priceFeedAddress);

  const owner = await presale.owner();
  console.log("   Owner:", owner);

  // Try to call the NFT contract
  console.log("\n🔍 CHECKING NFT CONTRACT:\n");

  const nftABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function balanceOf(address) view returns (uint256)"
  ];

  try {
    const nft = new ethers.Contract(nftAddress, nftABI, ethers.provider);
    const name = await nft.name();
    const symbol = await nft.symbol();
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);

    // Try to check a balance
    const testAddress = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";
    const balance = await nft.balanceOf(testAddress);
    console.log("   Balance of", testAddress + ":", balance.toString());
  } catch (error) {
    console.log("   ❌ Error querying NFT contract:");
    console.log("  ", error.message);
    console.log("\n   This NFT contract may not exist or may not be a valid ERC721 contract!");
  }
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
