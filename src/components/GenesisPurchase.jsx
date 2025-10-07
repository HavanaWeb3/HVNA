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
  Shield,
  Star
} from 'lucide-react'

const GenesisPurchase = () => {
  // EMERGENCY MAINTENANCE MODE - SALES DISABLED
  const EMERGENCY_MAINTENANCE = false  // ✅ RESOLVED: Now using secure infrastructure
  
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [purchaseStatus, setPurchaseStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState('0')
  const [ownedGenesis, setOwnedGenesis] = useState([])
  const [nftMetadata, setNftMetadata] = useState({})

  // Contract details - NEW BOLDLY ELEPHUNKY GENESIS
  const NFT_CONTRACT = "0x815D1bfaF945aCa39049FF243D6E406e2aEc3ff5" // Boldly Elephunky Genesis
  const SECURE_WALLET = "0x12EDd8CA5D79e4f1269E4Ce9e941bD05c4ceeE05" // Your secure Rabby wallet

  // Available NFTs (your current 5 minted)
  const availableNFTs = [1, 2, 3, 4, 5, 6] // Your 6 current NFTs (Jazz Virtuoso added today!)
  const comingSoonNFTs = Array.from({length: 94}, (_, i) => i + 7) // Daily additions

  // 4-Tier pricing structure for Boldly Elephunky Genesis
  const pricingTiers = [
    { 
      ids: [1, 2, 3, 4, 5], 
      price: '0.25', 
      tier: 'Genesis Launch', 
      description: 'First 5 Boldly Elephunky - Launch tier'
    },
    { 
      ids: Array.from({length: 20}, (_, i) => i + 6), 
      price: '0.50', 
      tier: 'Growth Tier', 
      description: 'Next 20 NFTs - 2x launch price'
    },
    { 
      ids: Array.from({length: 25}, (_, i) => i + 26), 
      price: '0.75', 
      tier: 'Premium Tier', 
      description: '25 Premium NFTs - High value'
    },
    { 
      ids: Array.from({length: 50}, (_, i) => i + 51), 
      price: '1.0', 
      tier: 'Elite Tier', 
      description: 'Final 50 NFTs - Maximum exclusivity'
    }
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

  // Connect wallet - simplified approach
  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setPurchaseStatus('❌ MetaMask not installed. Please install MetaMask extension.')
      return
    }

    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Requesting wallet connection...')
      
      // Simple direct connection request
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0])
        setIsConnected(true)
        setPurchaseStatus('✅ Wallet connected successfully!')
        
        // Update user info
        try {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })
          setUserBalance((parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4))
        } catch (balanceError) {
          console.log('Could not get balance:', balanceError)
        }
        
      } else {
        setPurchaseStatus('❌ No accounts found')
      }
      
    } catch (error) {
      console.error('Connection error:', error)
      setPurchaseStatus('❌ Connection failed: ' + (error.message || 'Unknown error'))
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

  // NFT image mapping - NEW Boldly Elephunky Genesis collection images
  const nftImageMapping = {
    1: 'MoonDreamer.jpg',        // Moon Dreamer - Boldly Elephunky Genesis #1
    2: 'HighlandLaird.jpg',      // Highland Laird - Boldly Elephunky Genesis #2
    3: 'RailMaster.jpg',         // Rail Master - Boldly Elephunky Genesis #3
    4: 'HighRoller.jpg',         // High Roller - Boldly Elephunky Genesis #4
    5: 'VenetianVoyager.jpg',    // Venetian Voyager - Boldly Elephunky Genesis #5 (reminted)
    6: 'JazzVirtuoso.jpg'        // Jazz Virtuoso - Boldly Elephunky Genesis #6 (NEW TODAY)
  }

  // OpenSea token ID mapping (website position -> actual OpenSea token ID)
  const openSeaTokenMapping = {
    1: 1, // Moon Dreamer
    2: 2, // Highland Laird  
    3: 3, // Rail Master
    4: 5, // High Roller (OpenSea token 5)
    5: 4, // Venetian Voyager (OpenSea token 4)
    6: 7  // Jazz Virtuoso (OpenSea token 7)
  }

  // Get real image for available NFTs (1-6)
  const getNFTImage = (tokenId) => {
    const imageFilename = nftImageMapping[tokenId]
    if (imageFilename) {
      return `/nft-images/${imageFilename}`
    }
    return generatePlaceholderImage(tokenId)
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
      'Genesis Launch': '#FFD700', // Gold
      'Growth Tier': '#FF6B6B', // Red
      'Premium Tier': '#9B59B6', // Purple
      'Elite Tier': '#3498DB' // Blue
    }
    const color = colors[tier?.tier] || '#FFD700'
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${color}"/>
        <text x="100" y="90" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">
          Boldly
        </text>
        <text x="100" y="110" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">
          Elephunky #${tokenId}
        </text>
        <text x="100" y="140" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">
          ${tier?.tier || 'Genesis Launch'}
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

      // Ensure we're on Base network
      await ensureBaseNetwork()
      setPurchaseStatus('🔄 Network verified, purchasing NFT...')

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

  // Load NFT metadata with real images
  useEffect(() => {
    const loadNFTMetadata = () => {
      const metadataCache = {}
      
      for (let tokenId = 1; tokenId <= 100; tokenId++) {
        // Check if we have a real image for this token
        const imageFilename = nftImageMapping[tokenId]
        
        if (imageFilename) {
          // Use real image
          metadataCache[tokenId] = {
            name: `Genesis Elephant #${tokenId}`,
            image: `nft-images/${imageFilename}`,
            description: `Genesis Elephant #${tokenId} - Ultra rare NFT with exclusive founder benefits`
          }
        } else {
          // Fallback to placeholder
          metadataCache[tokenId] = {
            name: `Genesis Elephant #${tokenId}`,
            image: generatePlaceholderImage(tokenId),
            description: `Genesis Elephant #${tokenId} - Coming soon with exclusive founder benefits`
          }
        }
      }
      
      console.log('NFT metadata loaded:', metadataCache[1], metadataCache[2]) // Debug
      setNftMetadata(metadataCache)
    }
    
    loadNFTMetadata()
  }, [])

  // EMERGENCY MAINTENANCE DISPLAY
  if (EMERGENCY_MAINTENANCE) {
    return (
      <div className="space-y-8 text-center">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-red-400 mb-4">🚨 EMERGENCY MAINTENANCE</h2>
          <p className="text-xl text-white mb-4">Genesis NFT sales are temporarily disabled</p>
          <p className="text-gray-300 mb-4">
            We are conducting urgent security maintenance. All sales have been suspended to protect our customers.
          </p>
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-300 font-semibold">
              ⚠️ DO NOT attempt to purchase Genesis NFTs on OpenSea or other platforms until this notice is removed.
            </p>
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            We will resume sales as soon as the security maintenance is complete. Thank you for your patience.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Crown className="h-10 w-10 text-orange-400" />
          🔥 Boldly Elephunky Genesis Collection
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Own a secure Boldly Elephunky NFT! 5 available now at 0.25 ETH, with 95 more coming daily.
          Each NFT grants 30% lifetime discounts and exclusive benefits.
        </p>

        {/* Base Network Notice - Prominent */}
        <div className="mt-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-900/40 to-green-900/40 border-green-500/50 backdrop-blur-md">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 rounded-full p-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">💡 Pay with Regular ETH - Save on Gas Fees!</h3>
                  <p className="text-gray-200 leading-relaxed">
                    You can purchase NFTs using your regular ETH. We use the <strong className="text-green-400">Base blockchain</strong> for
                    significantly lower gas fees (typically $0.50-$2 instead of $20-$100 on Ethereum mainnet).
                    You'll need a small amount of <strong className="text-green-400">Base ETH</strong> to pay the minimal gas fees.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-gray-300">Need Base ETH?</span>
                    <a
                      href="https://bridge.base.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-sm transition-colors"
                    >
                      Bridge ETH to Base <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-gray-400 text-sm">(Takes 2-3 minutes)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust & Credibility */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Verified Collection</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Official Genesis Elephants collection. Each NFT is a genuine ERC-721 token on Base network.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>Also available on OpenSea</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Contract: {NFT_CONTRACT.slice(0, 6)}...{NFT_CONTRACT.slice(-4)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <button 
                onClick={connectWallet}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
                  color: 'black',
                  fontWeight: '600',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  fontSize: '16px'
                }}
              >
                {isLoading ? 'Connecting...' : '🔗 Connect MetaMask'}
              </button>
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
                  <div className="text-sm text-gray-400">${(parseFloat(tier.price) * 2500).toLocaleString()}</div>
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
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          🔥 Boldly Elephunky Genesis NFTs
        </h3>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-400 text-black font-bold">Buy on OpenSea</Badge>
            <span className="text-white">Available ({availableNFTs.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500 text-white">Soon</Badge>
            <span className="text-white">Daily Additions ({comingSoonNFTs.length})</span>
          </div>
        </div>

        {/* Current Available NFTs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {availableNFTs.map(tokenId => {
            const tier = getTierForNFT(tokenId)
            const price = getPriceForNFT(tokenId)
            const isOwned = ownedGenesis.includes(tokenId)
            
            return (
              <div 
                key={tokenId}
                className="relative rounded-lg border-2 border-orange-400 bg-orange-400/20 transition-all overflow-hidden cursor-pointer hover:border-orange-300 hover:bg-orange-400/30"
                onClick={() => {
                  const realTokenId = tokenId === 4 ? 5 : tokenId === 5 ? 4 : tokenId === 6 ? 7 : tokenId;
                  window.open(`https://opensea.io/assets/base/${NFT_CONTRACT}/${realTokenId}`, '_blank');
                }}
              >
                {/* NFT Image */}
                <div className="aspect-square bg-gradient-to-br from-orange-700 to-yellow-800">
                  <img 
                    src={getNFTImage(tokenId)}
                    alt={`Boldly Elephunky #${tokenId}`}
                    className="w-full h-full object-cover rounded-t-lg"
                    onError={(e) => {
                      console.log(`Image failed for NFT #${tokenId}, using placeholder`)
                      e.target.src = generatePlaceholderImage(tokenId)
                    }}
                  />
                </div>
                
                {/* NFT Info */}
                <div className="p-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white mb-1">
                      Boldly Elephunky #{tokenId}
                    </div>
                    <div className="text-xs text-gray-300">{price} ETH</div>
                  </div>
                </div>
                
                {/* Badge */}
                <Badge className="absolute -top-1 -right-1 bg-orange-400 text-black text-xs font-bold">
                  Buy Now
                </Badge>
                
                {isOwned && (
                  <Badge className="absolute -top-1 -left-1 bg-green-500 text-white text-xs">
                    Owned
                  </Badge>
                )}
              </div>
            )
          })}
        </div>

        {/* Coming Soon Preview */}
        <div className="text-center">
          <h4 className="text-lg font-bold text-white mb-4">⏳ Coming Soon - Daily Drops</h4>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {comingSoonNFTs.slice(0, 20).map(tokenId => {
              const tier = getTierForNFT(tokenId)
              const price = getPriceForNFT(tokenId)
              
              return (
                <div 
                  key={tokenId}
                  className="relative rounded border border-gray-600 bg-gray-800/30 opacity-60"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-gray-400 text-xs">
                      <div className="font-bold">#{tokenId}</div>
                      <div>{price} ETH</div>
                    </div>
                  </div>
                  <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs">
                    Soon
                  </Badge>
                </div>
              )
            })}
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            New NFTs minted daily! Follow for updates on upcoming releases.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <Card className="bg-slate-900/50 border-orange-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-2xl">🔥 Boldly Elephunky Benefits</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <ul className="space-y-2">
            <li>• <strong className="text-orange-400">30% Lifetime Discount</strong> on havanaelephantbrand.com</li>
            <li>• <strong className="text-yellow-400">Automatic Recognition</strong> - wallet connects = discount applied</li>
            <li>• <strong className="text-purple-400">Token Holder Benefits</strong> - stack with HVNA token discounts</li>
            <li>• <strong className="text-pink-400">Priority Access</strong> to daily NFT drops</li>
            <li>• <strong className="text-blue-400">Exclusive Community</strong> - Boldly Elephunky holders only</li>
            <li>• <strong className="text-green-400">Future Utility</strong> - growing benefits ecosystem</li>
          </ul>
        </CardContent>
      </Card>

      {/* OpenSea Link */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 backdrop-blur-md">
        <CardContent className="pt-6 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Purchase on OpenSea</h3>
            <p className="text-gray-300">
              Buy directly from the official collection on OpenSea marketplace
            </p>
            <Button 
              onClick={() => window.open(`https://opensea.io/collection/boldly-elephunky-genesis`, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Collection on OpenSea
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GenesisPurchase