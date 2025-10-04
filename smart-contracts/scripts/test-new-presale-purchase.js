const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Testing purchase with wallet:", signer.address, "\n");

  const NEW_PRESALE = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";

  const presaleABI = [
    "function currentPhase() view returns (uint8)",
    "function saleActive() view returns (bool)",
    "function minPurchase() view returns (uint256)",
    "function maxPurchasePublic() view returns (uint256)",
    "function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) view returns (uint256 ethCost, uint256 usdCost)",
    "function purchasedAmount(address) view returns (uint256)",
    "function isGenesisHolder(address) view returns (bool)",
    "function buyTokens(uint256 tokenAmount) payable",
    "function hvnaToken() view returns (address)"
  ];

  const tokenABI = [
    "function balanceOf(address) view returns (uint256)"
  ];

  const presale = new ethers.Contract(NEW_PRESALE, presaleABI, signer);

  console.log("📊 PRESALE STATE:\n");

  const currentPhase = await presale.currentPhase();
  const phaseNames = ['Genesis', 'Public', 'Ended'];
  console.log("   Current Phase:", phaseNames[currentPhase]);

  const saleActive = await presale.saleActive();
  console.log("   Sale Active:", saleActive);

  console.log("\n👤 USER STATE:\n");

  const userAddress = signer.address;

  const isGenesis = await presale.isGenesisHolder(userAddress);
  console.log("   Is Genesis Holder:", isGenesis);

  const purchased = await presale.purchasedAmount(userAddress);
  console.log("   Already Purchased:", ethers.formatUnits(purchased, 18), "tokens");

  console.log("\n💰 COST FOR 1000 TOKENS:\n");

  const tokenAmount = ethers.parseUnits("1000", 18);
  const [ethCost, usdCost] = await presale.calculatePurchaseCost(tokenAmount, isGenesis);

  console.log("   USD Cost:", ethers.formatUnits(usdCost, 18), "USD");
  console.log("   ETH Cost:", ethers.formatEther(ethCost), "ETH");
  console.log("   ETH Cost (with 10% buffer):", (parseFloat(ethers.formatEther(ethCost)) * 1.1).toFixed(6), "ETH");

  console.log("\n🧪 TESTING PURCHASE:\n");

  try {
    const ethWithBuffer = BigInt(Math.floor(parseFloat(ethers.formatEther(ethCost)) * 1.1 * 1e18));

    console.log("   Simulating buyTokens(1000) with", ethers.formatEther(ethWithBuffer), "ETH...");

    // Static call to check if it would succeed
    await presale.buyTokens.staticCall(tokenAmount, { value: ethWithBuffer });
    console.log("   ✅ Purchase would SUCCEED!");

    console.log("\n   Ready to execute real purchase? (Run this script with --execute flag)");

  } catch (error) {
    console.log("   ❌ Purchase would FAIL:");
    console.log("  ", error.message);

    if (error.message.includes("Sale is not active")) {
      console.log("\n   ⚠️  The sale is not active!");
    } else if (error.message.includes("Phase not started")) {
      console.log("\n   ⚠️  The phase has not started yet!");
    } else if (error.message.includes("insufficient")) {
      console.log("\n   ⚠️  Insufficient ETH sent!");
    }
  }

  console.log("\n🪙 TOKEN BALANCE:\n");

  const tokenAddress = await presale.hvnaToken();
  const token = new ethers.Contract(tokenAddress, tokenABI, ethers.provider);
  const presaleBalance = await token.balanceOf(NEW_PRESALE);
  console.log("   Presale has:", ethers.formatUnits(presaleBalance, 18), "HVNA tokens");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
