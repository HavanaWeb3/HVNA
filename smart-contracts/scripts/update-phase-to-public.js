const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Updating phase with wallet:", signer.address, "\n");

  const presaleABI = [
    "function currentPhase() view returns (uint8)",
    "function updatePhase() external",
    "function genesisPhaseStart() view returns (uint256)",
    "function genesisPhaseEnd() view returns (uint256)",
    "function publicPhaseStart() view returns (uint256)",
    "function publicPhaseEnd() view returns (uint256)"
  ];

  const presale = new ethers.Contract("0x00e59916fEb5995E5657c68c71929B2E28E100d0", presaleABI, signer);

  console.log("📊 CURRENT STATE:\n");
  const currentPhaseBefore = await presale.currentPhase();
  const phaseNames = ['Genesis', 'Public', 'Ended'];
  console.log("   Current Phase:", phaseNames[currentPhaseBefore]);

  const gStart = await presale.genesisPhaseStart();
  const gEnd = await presale.genesisPhaseEnd();
  const pStart = await presale.publicPhaseStart();
  const pEnd = await presale.publicPhaseEnd();

  const now = Math.floor(Date.now() / 1000);
  console.log("   Genesis Start:", new Date(Number(gStart) * 1000).toLocaleString());
  console.log("   Genesis End:", new Date(Number(gEnd) * 1000).toLocaleString());
  console.log("   Public Start:", new Date(Number(pStart) * 1000).toLocaleString());
  console.log("   Public End:", new Date(Number(pEnd) * 1000).toLocaleString());
  console.log("   Current Time:", new Date(now * 1000).toLocaleString());

  console.log("\n🔄 Calling updatePhase()...\n");
  const tx = await presale.updatePhase();
  console.log("Transaction:", tx.hash);
  await tx.wait();

  const currentPhaseAfter = await presale.currentPhase();
  console.log("\n✅ Phase updated!");
  console.log("   New Phase:", phaseNames[currentPhaseAfter]);
  console.log("\n✅ Anyone can now buy tokens!");
  console.log("   - Genesis NFT holders get 30% discount");
  console.log("   - Public users pay full price");
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
