import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Crown, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Star
} from 'lucide-react'

const GenesisPurchase = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [purchaseStatus, setPurchaseStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState('0')
  const [ownedGenesis, setOwnedGenesis] = useState([])
  const [nftMetadata, setNftMetadata] = useState({})

  // Contract details
  const NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"
  const MARKETPLACE_CONTRACT = "0x9a0dcE791C7B61647a12266de77a6a1149889f56"
  const OWNER_ADDRESS = "0x4844382d686CE775e095315C084d40cEd16d8Cf5" // Updated to secure wallet

  // Available NFTs (ready for purchase)
  const availableNFTs = [
    3, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90
  ] // 58 NFTs available for purchase
  const soldNFTs = [1, 2, 4] // NFTs already in secure wallet
  const [marketplaceListings, setMarketplaceListings] = useState({})

  // Genesis NFT pricing tiers
  const pricingTiers = [
    { ids: [1, 2, 3, 4, 5], price: '2.5', tier: 'Ultra Rare', description: 'First 5 Genesis - Maximum exclusivity' },
    { ids: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15], price: '2.0', tier: 'Legendary', description: 'Elite Genesis collection' },
    { ids: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], price: '1.5', tier: 'Epic', description: 'Premium Genesis NFTs' },
    { ids: Array.from({length: 70}, (_, i) => i + 31), price: '1.0', tier: 'Genesis', description: 'Genesis collection' }
  ]

  // Get price for NFT ID
  const getPriceForNFT = (tokenId) => {
    const tier = pricingTiers.find(tier => tier.ids.includes(tokenId))
    return tier ? tier.price : '1.0'
  }

  // Get tier info for NFT ID
  const getTierForNFT = (tokenId) => {
    return pricingTiers.find(tier => tier.ids.includes(tokenId))
  }

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setPurchaseStatus('❌ MetaMask not found. Please install MetaMask.')
      window.open('https://metamask.io/', '_blank')
      return
    }

    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Connecting to MetaMask...')
      
      // First check if already connected
      const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      if (existingAccounts.length === 0) {
        // Request connection
        setPurchaseStatus('🔄 Please approve connection in MetaMask popup...')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        if (accounts.length > 0) {
          setUserAddress(accounts[0])
          setIsConnected(true)
          setPurchaseStatus('✅ Wallet connected successfully!')
          
          // Switch to Base network and load data
          await ensureBaseNetwork()
          await updateUserInfo(accounts[0])
        }
      } else {
        // Already connected
        setUserAddress(existingAccounts[0])
        setIsConnected(true)
        setPurchaseStatus('✅ Wallet reconnected successfully!')
        
        await ensureBaseNetwork()
        await updateUserInfo(existingAccounts[0])
      }
      
    } catch (error) {
      console.error('Wallet connection error:', error)
      if (error.code === 4001) {
        setPurchaseStatus('❌ Connection cancelled by user')
      } else if (error.code === -32002) {
        setPurchaseStatus('❌ Connection request pending. Please check MetaMask popup.')
      } else {
        setPurchaseStatus('❌ Connection failed: ' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Ensure Base network
  const ensureBaseNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (chainId !== '0x2105') { // Base mainnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }],
        })
      }
    } catch (error) {
      if (error.code === 4902) {
        // Add Base network
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x2105',
            chainName: 'Base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org/']
          }]
        })
      }
    }
  }

  // Update user info
  const updateUserInfo = async (address) => {
    try {
      // Get ETH balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      const balanceETH = parseInt(balance, 16) / Math.pow(10, 18)
      setUserBalance(balanceETH.toFixed(4))

      // Check owned Genesis NFTs
      await checkOwnedGenesis(address)
      
    } catch (error) {
      console.error('Failed to update user info:', error)
    }
  }

  // Check owned Genesis NFTs
  const checkOwnedGenesis = async (address) => {
    try {
      const owned = []
      // Check first 20 Genesis NFTs for ownership (to avoid too many calls)
      for (let i = 1; i <= 20; i++) {
        const owner = await getTokenOwner(i)
        if (owner && owner.toLowerCase() === address.toLowerCase()) {
          owned.push(i)
        }
      }
      setOwnedGenesis(owned)
    } catch (error) {
      console.error('Failed to check owned Genesis:', error)
    }
  }

  // Check marketplace listings
  const checkMarketplaceListings = async () => {
    try {
      const listings = {}
      // Check if available NFTs are actually listed in marketplace
      for (const tokenId of availableNFTs) {
        try {
          const isForSaleSignature = "0x94383f14" // isForSale(uint256)
          const tokenIdParam = tokenId.toString(16).padStart(64, '0')
          const data = isForSaleSignature + tokenIdParam

          const result = await window.ethereum.request({
            method: 'eth_call',
            params: [{ to: MARKETPLACE_CONTRACT, data: data }, 'latest']
          })

          listings[tokenId] = result && result !== '0x' && parseInt(result, 16) === 1
        } catch (error) {
          listings[tokenId] = false
        }
      }
      setMarketplaceListings(listings)
    } catch (error) {
      console.error('Failed to check marketplace listings:', error)
    }
  }

  // Get token owner
  const getTokenOwner = async (tokenId) => {
    try {
      const ownerOfSignature = "0x6352211e"
      const tokenIdParam = tokenId.toString(16).padStart(64, '0')
      const data = ownerOfSignature + tokenIdParam

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: NFT_CONTRACT, data: data }, 'latest']
      })

      if (result && result !== '0x') {
        return '0x' + result.slice(-40)
      }
      return null
    } catch (error) {
      return null
    }
  }

  // NFT image mapping - maps token ID to actual image filename
  const nftImageMapping = {
    1: 'TheDistinguishedPachyderm.jpg',
    2: 'TheGentlemen.jpg', 
    3: 'TheRomanEmperor.jpg',
    4: 'TheMoscowAristocrat.jpg',
    5: 'TheParisianNoble.jpg',
    6: 'TheAthenianScholar.jpg',
    7: 'TheBerlinAristocrat.jpg',
    8: 'TheItalianConnoisseur.jpg',
    9: 'TheHighlandLaird.jpg',
    10: 'TheBavarianBaron.jpg',
    11: 'TheVaticanVisitor.jpg',
    12: 'TheTajMaharaja.jpg',
    13: 'TheCapeTownConnosoir.jpg',
    14: 'TheJazzVirtuoso.jpg',
    15: 'ThePianoMaestro.jpg',
    16: 'TheVirtuosoViolinist.jpg',
    17: 'TheParisianGentlemen.jpg',
    18: 'TheManhattanSocialite.jpg',
    19: 'TheSydneySocialite.jpg',
    20: 'TheWallStreetTitan.jpg',
    21: 'TheAcePilot.jpg',
    22: 'TheRocketExplorer.jpg',
    23: 'TheCosmicVoyager.jpg',
    24: 'TheGreatWallAdventurer.jpg',
    25: 'TheLondonMonument.jpg',
    26: 'TheVenetianVoyager.jpg',
    27: 'TheBalloonVoyager.jpg',
    28: 'TheOceanVoyager.jpg',
    29: 'TheOceanExplorer.jpg',
    30: 'TheParadiseExplorer.jpg',
    31: 'TheRiverNavigator.jpg',
    32: 'TheRiverNavi.jpg',
    33: 'TheDesertRider.jpg',
    34: 'TheMountainSpirit.jpg',
    35: 'TheWIldernessExplorer.jpg',
    36: 'TheBeachCruiser.jpg',
    37: 'TheSkyAdventurer.jpg',
    38: 'TheGothicRider.jpg',
    39: 'TheCountrysideConnoisseur.jpg',
    40: 'TheCanyonCyclist.jpg',
    41: 'TheRegattaChampion.jpg',
    42: 'TheRacingChampion.jpg',
    43: 'TheSprintChampion.jpg',
    44: 'ThePowerLifter.jpg',
    45: 'TheJetSkiMerrymaker.jpg',
    46: 'TheVespaVoyager.jpg',
    47: 'TheParkRoller.jpg',
    48: 'TheGardenSkater.jpg',
    49: 'TheFestivalHeadliner.jpg',
    50: 'TheHighRoller.jpg',
    51: 'TheSteamEngineer.jpg',
    52: 'TheEveningConnoisseur.jpg',
    53: 'TheSunsetSophisticate.jpg',
    54: 'TheMoonlightDreamer.jpg',
    55: 'TheMoonWorshipper.jpg',
    56: 'TheOceanDeity.jpg',
    57: 'TheBallet.Patron.jpg',
    58: 'TheWinterDancer.jpg',
    59: 'TheDutchGardener.jpg',
    60: 'TheTropicalGuitarist.jpg',
    61: 'TheSafari.Lounger.jpg',
    62: 'FIrstClassVoyager.jpg',
    63: 'ParliamentarySession.jpg',
    64: 'THeClubMember.jpg',
    65: 'THeRussianAristocrat.jpg'
  }

  // Fetch NFT metadata and image
  const fetchNFTMetadata = async (tokenId) => {
    // Check if we have a real image for this token
    const imageFilename = nftImageMapping[tokenId]
    
    if (imageFilename) {
      // Use real image
      return {
        name: `Genesis Elephant #${tokenId}`,
        image: `/nft-images/${imageFilename}`,
        description: `Genesis Elephant #${tokenId} - Ultra rare NFT with exclusive founder benefits`
      }
    }
    
    // Fallback to placeholder for unminted NFTs
    return {
      name: `Genesis Elephant #${tokenId}`,
      image: generatePlaceholderImage(tokenId),
      description: `Genesis Elephant #${tokenId} - Coming soon with exclusive founder benefits`
    }
  }

  // Decode URI data from hex
  const decodeURIData = (hex) => {
    try {
      // Skip length prefix and decode
      const data = hex.slice(64)
      let result = ''
      for (let i = 0; i < data.length; i += 2) {
        const char = String.fromCharCode(parseInt(data.substr(i, 2), 16))
        if (char !== '\0') result += char
      }
      return result
    } catch (error) {
      return null
    }
  }

  // Generate placeholder image
  const generatePlaceholderImage = (tokenId) => {
    const tier = getTierForNFT(tokenId)
    const colors = {
      'Ultra Rare': '#FFD700', // Gold
      'Legendary': '#FF6B6B', // Red
      'Epic': '#9B59B6', // Purple
      'Genesis': '#3498DB' // Blue
    }
    const color = colors[tier?.tier] || '#3498DB'
    
    // Return a simple SVG placeholder
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${color}"/>
        <text x="100" y="100" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">
          Genesis #${tokenId}
        </text>
        <text x="100" y="130" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">
          ${tier?.tier || 'Genesis'}
        </text>
      </svg>
    `)}`
  }

  // Purchase Genesis NFT through marketplace
  const purchaseNFT = async (tokenId) => {
    if (!isConnected) {
      setPurchaseStatus('❌ Please connect your wallet first')
      return
    }

    const price = getPriceForNFT(tokenId)
    const priceWei = `0x${Math.floor(parseFloat(price) * Math.pow(10, 18)).toString(16)}`

    try {
      setIsLoading(true)
      setSelectedNFT(tokenId)
      setPurchaseStatus('🔄 Purchasing NFT...')

      // Call marketplace buyNFT function
      const buyNFTSignature = "0x961f0944" // buyNFT(uint256)
      const tokenIdParam = tokenId.toString(16).padStart(64, '0')
      const data = buyNFTSignature + tokenIdParam

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: MARKETPLACE_CONTRACT,
          data: data,
          value: priceWei
        }]
      })

      setPurchaseStatus('🔄 Transaction submitted: ' + txHash)
      
      // Wait for confirmation
      const receipt = await waitForTransaction(txHash)
      
      if (receipt.status === '0x1') {
        setPurchaseStatus('🎉 Genesis NFT purchased successfully!')
        await updateUserInfo(userAddress) // Refresh user info
      } else {
        setPurchaseStatus('❌ Transaction failed')
      }

    } catch (error) {
      setPurchaseStatus('❌ Purchase failed: ' + error.message)
    } finally {
      setIsLoading(false)
      setSelectedNFT(null)
    }
  }

  // Wait for transaction
  const waitForTransaction = async (txHash) => {
    let attempts = 0
    const maxAttempts = 60

    while (attempts < maxAttempts) {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        })
        
        if (receipt) {
          return receipt
        }
      } catch (error) {
        console.error('Error checking transaction:', error)
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    
    throw new Error('Transaction timeout')
  }

  // Load metadata for all NFTs and marketplace listings
  useEffect(() => {
    const loadMetadata = async () => {
      const metadataCache = {}
      
      // Load metadata for all 100 Genesis NFTs
      for (let tokenId = 1; tokenId <= 100; tokenId++) {
        try {
          const metadata = await fetchNFTMetadata(tokenId)
          metadataCache[tokenId] = metadata
        } catch (error) {
          // Always provide placeholder for failed metadata
          metadataCache[tokenId] = {
            name: `Genesis Elephant #${tokenId}`,
            image: generatePlaceholderImage(tokenId),
            description: `Genesis Elephant #${tokenId}`
          }
        }
      }
      
      setNftMetadata(metadataCache)
    }

    const loadInitialData = async () => {
      await loadMetadata()
      await checkMarketplaceListings()
    }

    loadInitialData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Crown className="h-10 w-10 text-yellow-400" />
          Genesis NFT Collection
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Own a piece of HVNA history. Only 100 Genesis NFTs exist, each granting 30% lifetime discounts 
          and exclusive founder benefits.
        </p>
      </div>

      {/* Connection Status */}
      <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-gray-300">Connect your wallet to purchase Genesis NFTs</p>
              <Button 
                onClick={connectWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white">Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
              </div>
              <div className="text-gray-300">
                Balance: {userBalance} ETH
              </div>
              {ownedGenesis.length > 0 && (
                <div className="text-yellow-400">
                  You own Genesis NFTs: {ownedGenesis.join(', ')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Status */}
      {purchaseStatus && (
        <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              {purchaseStatus.includes('❌') ? (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              ) : purchaseStatus.includes('✅') || purchaseStatus.includes('🎉') ? (
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-400 mt-0.5 animate-spin" />
              )}
              <p className="text-white">{purchaseStatus}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricingTiers.map((tier, index) => (
          <Card key={index} className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-white">{tier.tier}</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                {tier.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{tier.price} ETH</div>
                  <div className="text-sm text-gray-400">${(parseFloat(tier.price) * 4200).toLocaleString()}</div>
                </div>
                <Badge variant="outline" className="w-full justify-center">
                  {tier.ids.length} NFTs Available
                </Badge>
                <div className="text-xs text-gray-400 text-center">
                  IDs: {tier.ids.length > 10 ? 
                    `${tier.ids.slice(0, 3).join(', ')}...${tier.ids.slice(-2).join(', ')}` : 
                    tier.ids.join(', ')
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available NFTs Grid */}
      {isConnected && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Select Your Genesis NFT
          </h3>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-400 text-black font-bold">Buy Now</Badge>
              <span className="text-white">Available ({availableNFTs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Sold</Badge>
              <span className="text-white">Purchased ({soldNFTs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white">Soon</Badge>
              <span className="text-white">Coming Soon ({100 - availableNFTs.length - soldNFTs.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {Array.from({length: 100}, (_, i) => i + 1).map(tokenId => {
              const tier = getTierForNFT(tokenId)
              const price = getPriceForNFT(tokenId)
              const isOwned = ownedGenesis.includes(tokenId)
              const isAvailable = availableNFTs.includes(tokenId) && !isSold // Available if in availableNFTs array and not sold
              const isSold = soldNFTs.includes(tokenId)
              const isComingSoon = !isAvailable && !isSold
              
              return (
                <div 
                  key={tokenId}
                  className={`
                    relative rounded-lg border-2 transition-all overflow-hidden
                    ${isSold
                      ? 'border-green-500 bg-green-500/20' 
                      : isAvailable 
                        ? 'border-yellow-400 bg-yellow-400/20 cursor-pointer hover:border-yellow-300 hover:bg-yellow-400/30'
                        : 'border-gray-600 bg-gray-800/30 cursor-not-allowed opacity-60'
                    }
                    ${selectedNFT === tokenId ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  onClick={() => isAvailable && !isLoading && purchaseNFT(tokenId)}
                >
                  {/* NFT Image */}
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800">
                    {nftMetadata[tokenId] ? (
                      <img 
                        src={nftMetadata[tokenId].image} 
                        alt={nftMetadata[tokenId].name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = generatePlaceholderImage(tokenId)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <div className="text-2xl font-bold">#{tokenId}</div>
                          <div className="text-xs">Loading...</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* NFT Info */}
                  <div className="p-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white mb-1">
                        {nftMetadata[tokenId]?.name || `Genesis #${tokenId}`}
                      </div>
                      <div className="text-xs text-gray-300">{price} ETH</div>
                    </div>
                  </div>
                  
                  {/* Badge - Only show one */}
                  {isSold ? (
                    <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs">
                      Sold
                    </Badge>
                  ) : isAvailable ? (
                    <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold">
                      Buy Now
                    </Badge>
                  ) : (
                    <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs">
                      Soon
                    </Badge>
                  )}
                  
                  {selectedNFT === tokenId && (
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-400 mx-auto mt-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Benefits */}
      <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Genesis NFT Benefits</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <ul className="space-y-2">
            <li>• <strong className="text-yellow-400">30% Lifetime Discount</strong> on all products</li>
            <li>• <strong className="text-purple-400">Founder Status</strong> with exclusive governance rights</li>
            <li>• <strong className="text-pink-400">Priority Access</strong> to all future drops</li>
            <li>• <strong className="text-blue-400">VIP Events</strong> and exclusive community access</li>
            <li>• <strong className="text-green-400">Brand Collaboration</strong> opportunities</li>
            <li>• <strong className="text-orange-400">Automatic Verification</strong> on all Web3 platforms</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default GenesisPurchase