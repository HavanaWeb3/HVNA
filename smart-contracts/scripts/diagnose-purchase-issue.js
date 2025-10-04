const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Diagnosing with wallet:", signer.address, "\n");

  const presaleABI = [
    "function currentPhase() view returns (uint8)",
    "function saleActive() view returns (bool)",
    "function minPurchase() view returns (uint256)",
    "function maxPurchaseGenesis() view returns (uint256)",
    "function maxPurchasePublic() view returns (uint256)",
    "function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) view returns (uint256 ethCost, uint256 usdCost)",
    "function purchasedAmount(address) view returns (uint256)",
    "function isGenesisHolder(address) view returns (bool)",
    "function hvnaToken() view returns (address)",
    "function genesisNFT() view returns (address)"
  ];

  const tokenABI = [
    "function balanceOf(address) view returns (uint256)"
  ];

  const presale = new ethers.Contract("0x00e59916fEb5995E5657c68c71929B2E28E100d0", presaleABI, signer);

  console.log("📊 PRESALE STATE:\n");

  const currentPhase = await presale.currentPhase();
  const phaseNames = ['Genesis', 'Public', 'Ended'];
  console.log("   Current Phase:", phaseNames[currentPhase]);

  const saleActive = await presale.saleActive();
  console.log("   Sale Active:", saleActive);

  const minPurchase = await presale.minPurchase();
  console.log("   Min Purchase:", ethers.formatUnits(minPurchase, 18), "tokens");

  const maxPurchaseGenesis = await presale.maxPurchaseGenesis();
  console.log("   Max Purchase (Genesis):", ethers.formatUnits(maxPurchaseGenesis, 18), "tokens");

  const maxPurchasePublic = await presale.maxPurchasePublic();
  console.log("   Max Purchase (Public):", ethers.formatUnits(maxPurchasePublic, 18), "tokens");

  console.log("\n👤 USER STATE (0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05):\n");

  const userAddress = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05";

  const isGenesis = await presale.isGenesisHolder(userAddress);
  console.log("   Is Genesis Holder:", isGenesis);

  const purchased = await presale.purchasedAmount(userAddress);
  console.log("   Already Purchased:", ethers.formatUnits(purchased, 18), "tokens");

  console.log("\n💰 COST CALCULATION FOR 1000 TOKENS:\n");

  const tokenAmount = ethers.parseUnits("1000", 18);

  try {
    const [ethCost, usdCost] = await presale.calculatePurchaseCost(tokenAmount, isGenesis);
    console.log("   Token Amount:", "1000 tokens");
    console.log("   Is Genesis Holder:", isGenesis);
    console.log("   USD Cost:", ethers.formatUnits(usdCost, 18), "USD");
    console.log("   ETH Cost:", ethers.formatEther(ethCost), "ETH");
    console.log("   ETH Cost (with 10% buffer):", (parseFloat(ethers.formatEther(ethCost)) * 1.1).toFixed(6), "ETH");
  } catch (error) {
    console.log("   ❌ Error calculating cost:", error.message);
  }

  console.log("\n🪙 TOKEN BALANCE:\n");

  const tokenAddress = await presale.hvnaToken();
  console.log("   Token Address:", tokenAddress);

  const token = new ethers.Contract(tokenAddress, tokenABI, signer);
  const presaleBalance = await token.balanceOf(presale.target);
  console.log("   Presale Token Balance:", ethers.formatUnits(presaleBalance, 18), "tokens");

  console.log("\n🧪 SIMULATING PURCHASE:\n");

  try {
    const [ethCost] = await presale.calculatePurchaseCost(tokenAmount, isGenesis);
    const ethWithBuffer = BigInt(Math.floor(parseFloat(ethers.formatEther(ethCost)) * 1.1 * 1e18));

    console.log("   Attempting to call buyTokens(1000) with", ethers.formatEther(ethWithBuffer), "ETH...");

    // Try to estimate gas - this will revert with the actual error message
    const tx = await presale.buyTokens.staticCall(tokenAmount, { value: ethWithBuffer });
    console.log("   ✅ Transaction would succeed!");
  } catch (error) {
    console.log("   ❌ Transaction would fail with error:");
    console.log("  ", error.message);

    // Try to extract revert reason
    if (error.data) {
      console.log("\n   Revert data:", error.data);
    }
  }

  console.log("\n🔍 CHECKING PURCHASE LIMITS:\n");

  const requestedAmount = 1000;
  const alreadyPurchased = parseFloat(ethers.formatUnits(purchased, 18));
  const totalAfterPurchase = alreadyPurchased + requestedAmount;
  const maxAllowed = parseFloat(ethers.formatUnits(maxPurchasePublic, 18));

  console.log("   Requested:", requestedAmount, "tokens");
  console.log("   Already Purchased:", alreadyPurchased, "tokens");
  console.log("   Total After Purchase:", totalAfterPurchase, "tokens");
  console.log("   Max Allowed:", maxAllowed, "tokens");
  console.log("   Within Limit:", totalAfterPurchase <= maxAllowed ? "✅ YES" : "❌ NO");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
