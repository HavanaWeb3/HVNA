const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  console.log("🔍 DEBUGGING PRICING CALCULATION:\n");

  const NEW_PRESALE = "0x90EB45B474Cf6f6449F553796464262ecCAC1023";

  const presaleABI = [
    "function getETHUSDPrice() view returns (uint256)",
    "function getTokenPriceInETH(bool isGenesis) view returns (uint256)",
    "function calculatePurchaseCost(uint256 tokenAmount, bool isGenesis) view returns (uint256 ethCost, uint256 usdCost)",
    "function tokenPriceUSDCents() view returns (uint256)",
    "function genesisDiscountPercent() view returns (uint256)"
  ];

  const presale = new ethers.Contract(NEW_PRESALE, presaleABI, ethers.provider);

  console.log("📊 CONTRACT PARAMETERS:\n");

  const tokenPriceUSDCents = await presale.tokenPriceUSDCents();
  console.log("   Token Price (cents):", tokenPriceUSDCents.toString(), "cents");
  console.log("   Token Price (USD):", "$" + (Number(tokenPriceUSDCents) / 100).toFixed(2));

  const genesisDiscount = await presale.genesisDiscountPercent();
  console.log("   Genesis Discount:", genesisDiscount.toString() + "%");

  const ethUsdPrice = await presale.getETHUSDPrice();
  console.log("   ETH/USD Price (8 decimals):", ethUsdPrice.toString());
  console.log("   ETH/USD Price:", "$" + (Number(ethUsdPrice) / 1e8).toFixed(2));

  console.log("\n💰 TOKEN PRICE IN ETH:\n");

  const tokenPriceETHGenesis = await presale.getTokenPriceInETH(true);
  const tokenPriceETHPublic = await presale.getTokenPriceInETH(false);

  console.log("   Genesis holder:", ethers.formatEther(tokenPriceETHGenesis), "ETH per token");
  console.log("   Public:", ethers.formatEther(tokenPriceETHPublic), "ETH per token");

  console.log("\n🧮 MANUAL CALCULATION FOR 1 TOKEN (PUBLIC):\n");

  const ethPrice = Number(ethUsdPrice) / 1e8; // Convert to normal number
  const tokenPriceUSD = Number(tokenPriceUSDCents) / 100; // $0.01

  console.log("   Token price:", "$" + tokenPriceUSD);
  console.log("   ETH price:", "$" + ethPrice);
  console.log("   Expected ETH per token:", tokenPriceUSD / ethPrice, "ETH");
  console.log("   Contract says:", ethers.formatEther(tokenPriceETHPublic), "ETH");

  console.log("\n💵 COST FOR 1000 TOKENS:\n");

  const tokenAmount = ethers.parseUnits("1000", 18);
  const [ethCost, usdCost] = await presale.calculatePurchaseCost(tokenAmount, false);

  console.log("   Contract calculates:");
  console.log("     ETH Cost:", ethers.formatEther(ethCost), "ETH");
  console.log("     USD Cost:", ethers.formatUnits(usdCost, 18), "USD");

  console.log("\n   Manual calculation:");
  const expectedUSD = 1000 * tokenPriceUSD;
  const expectedETH = expectedUSD / ethPrice;
  console.log("     Expected USD:", "$" + expectedUSD.toFixed(2));
  console.log("     Expected ETH:", expectedETH.toFixed(6), "ETH");

  console.log("\n⚠️  ISSUE:");
  const contractETH = parseFloat(ethers.formatEther(ethCost));
  const ratio = contractETH / expectedETH;
  console.log("   Contract is charging", ratio.toFixed(2) + "x too much!");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
