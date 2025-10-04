const { ethers } = require('ethers');

async function diagnose() {
  const presaleAddress = '0x00e59916fEb5995E5657c68c71929B2E28E100d0';
  const tokenAddress = '0xb5561D071b39221239a56F0379a6bb96C85fb94f';

  // Use public RPC
  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');

  const presaleABI = [
    'function isSaleActive() view returns (bool)',
    'function currentPhase() view returns (uint8)',
    'function genesisPhaseStart() view returns (uint256)',
    'function genesisPhaseEnd() view returns (uint256)',
    'function publicPhaseStart() view returns (uint256)',
    'function publicPhaseEnd() view returns (uint256)',
    'function tokenPrice() view returns (uint256)',
    'function genesisNFTDiscount() view returns (uint256)',
    'function minPurchaseAmount() view returns (uint256)',
    'function maxGenesisSupply() view returns (uint256)',
    'function maxTotalSupply() view returns (uint256)',
    'function totalTokensSold() view returns (uint256)',
    'function individualPurchaseLimit() view returns (uint256)'
  ];

  const tokenABI = [
    'function balanceOf(address) view returns (uint256)'
  ];

  const presale = new ethers.Contract(presaleAddress, presaleABI, provider);
  const token = new ethers.Contract(tokenAddress, tokenABI, provider);

  console.log('=== PRESALE CONTRACT DIAGNOSTICS ===\n');

  try {
    const isSaleActive = await presale.isSaleActive();
    console.log('✓ Sale Active:', isSaleActive);

    const currentPhase = await presale.currentPhase();
    const phaseNames = ['Genesis', 'Public', 'Ended'];
    console.log('✓ Current Phase:', currentPhase, `(${phaseNames[currentPhase] || 'Unknown'})`);

    const genesisStart = await presale.genesisPhaseStart();
    const genesisEnd = await presale.genesisPhaseEnd();
    const publicStart = await presale.publicPhaseStart();
    const publicEnd = await presale.publicPhaseEnd();

    const now = Math.floor(Date.now() / 1000);
    console.log('\n✓ Genesis Phase:');
    console.log('  Start:', new Date(Number(genesisStart) * 1000).toLocaleString());
    console.log('  End:', new Date(Number(genesisEnd) * 1000).toLocaleString());
    console.log('  Active:', now >= genesisStart && now <= genesisEnd);

    console.log('\n✓ Public Phase:');
    console.log('  Start:', new Date(Number(publicStart) * 1000).toLocaleString());
    console.log('  End:', new Date(Number(publicEnd) * 1000).toLocaleString());
    console.log('  Active:', now >= publicStart && now <= publicEnd);

    const tokenPrice = await presale.tokenPrice();
    console.log('\n✓ Token Price:', ethers.formatEther(tokenPrice), 'ETH');

    const discount = await presale.genesisNFTDiscount();
    console.log('✓ Genesis NFT Discount:', discount.toString() + '%');

    const minPurchase = await presale.minPurchaseAmount();
    console.log('✓ Min Purchase Amount:', minPurchase.toString(), 'tokens');

    const individualLimit = await presale.individualPurchaseLimit();
    console.log('✓ Individual Purchase Limit:', individualLimit.toString(), 'tokens');

    const totalSold = await presale.totalTokensSold();
    console.log('✓ Total Tokens Sold:', ethers.formatUnits(totalSold, 18));

    const maxGenesis = await presale.maxGenesisSupply();
    console.log('✓ Max Genesis Supply:', ethers.formatUnits(maxGenesis, 18));

    const maxTotal = await presale.maxTotalSupply();
    console.log('✓ Max Total Supply:', ethers.formatUnits(maxTotal, 18));

    const presaleBalance = await token.balanceOf(presaleAddress);
    console.log('\n✓ Presale Token Balance:', ethers.formatUnits(presaleBalance, 18), 'HVNA');

    console.log('\n=== PURCHASE REQUIREMENTS ===');
    console.log('For 1000 tokens:');
    const cost = BigInt(1000) * tokenPrice;
    console.log('  Cost:', ethers.formatEther(cost), 'ETH');
    console.log('  Meets minimum?', 1000 >= Number(minPurchase));
    console.log('  Under individual limit?', individualLimit === 0n || 1000 <= Number(individualLimit));
    console.log('  Tokens available?', presaleBalance >= ethers.parseUnits('1000', 18));

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

diagnose().catch(console.error);
