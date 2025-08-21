import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Crown, Wallet, CheckCircle } from 'lucide-react'

const SimpleGenesisPurchase = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Available NFTs
  const availableNFTs = [
    3, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
    71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90
  ]
  const soldNFTs = [1, 2, 4]

  // Pricing tiers
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

  // Generate placeholder image - simplified version
  const generatePlaceholderImage = (tokenId) => {
    const tier = getTierForNFT(tokenId)
    const colors = {
      'Ultra Rare': '#FFD700',
      'Legendary': '#FF6B6B', 
      'Epic': '#9B59B6',
      'Genesis': '#3498DB'
    }
    const color = colors[tier?.tier] || '#3498DB'
    
    // Simple URL encoding instead of base64
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${color}"/>
      <text x="100" y="80" font-family="Arial" font-size="18" fill="white" text-anchor="middle">Genesis</text>
      <text x="100" y="110" font-family="Arial" font-size="32" fill="white" text-anchor="middle" font-weight="bold">#${tokenId}</text>
      <text x="100" y="140" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${tier?.tier || 'Genesis'}</text>
      <text x="100" y="165" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${getPriceForNFT(tokenId)} ETH</text>
    </svg>`
    
    return 'data:image/svg+xml,' + encodeURIComponent(svg)
  }

  // Simple wallet connection
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus('❌ MetaMask not installed')
      return
    }

    try {
      setIsLoading(true)
      setStatus('🔄 Connecting to MetaMask...')
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0])
        setIsConnected(true)
        setStatus('✅ Wallet connected! You can now view available Genesis NFTs.')
      } else {
        setStatus('❌ No accounts found')
      }
      
    } catch (error) {
      console.error('Connection error:', error)
      setStatus('❌ Connection failed: ' + (error.message || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Simple purchase function with actual feedback
  const purchaseNFT = async (tokenId) => {
    if (!isConnected) {
      setStatus('❌ Please connect your wallet first')
      return
    }
    
    const price = getPriceForNFT(tokenId)
    const tier = getTierForNFT(tokenId)
    
    setStatus(`🛒 Selected: Genesis #${tokenId} (${tier?.tier}) - ${price} ETH. Purchase functionality will be enabled soon. Currently in demo mode.`)
    
    // Simulate purchase process
    setTimeout(() => {
      setStatus(`✨ Genesis #${tokenId} selected! Full purchase integration coming soon. This NFT will cost ${price} ETH when live.`)
    }, 1500)
  }

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
            </div>
          )}
          
          {status && (
            <div className="mt-4 p-3 bg-slate-800 rounded-md">
              <p className="text-white text-sm">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricingTiers.map((tier, index) => (
          <Card key={index} className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">{tier.tier}</CardTitle>
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
              const isAvailable = availableNFTs.includes(tokenId)
              const isSold = soldNFTs.includes(tokenId)
              
              return (
                <div 
                  key={tokenId}
                  className={`
                    relative rounded-lg border-2 transition-all overflow-hidden
                    ${isSold
                      ? 'border-green-500 bg-green-500/20' 
                      : isAvailable 
                        ? 'border-yellow-400 bg-yellow-400/20 cursor-pointer hover:border-yellow-300'
                        : 'border-gray-600 bg-gray-800/30 cursor-not-allowed opacity-60'
                    }
                  `}
                  onClick={() => isAvailable && purchaseNFT(tokenId)}
                >
                  {/* NFT Image */}
                  <div className="aspect-square relative flex items-center justify-center text-white text-center p-4"
                       style={{
                         background: (() => {
                           const tier = getTierForNFT(tokenId)
                           const colors = {
                             'Ultra Rare': 'linear-gradient(135deg, #FFD700, #FFA500)',
                             'Legendary': 'linear-gradient(135deg, #FF6B6B, #FF4757)', 
                             'Epic': 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                             'Genesis': 'linear-gradient(135deg, #3498DB, #2980B9)'
                           }
                           return colors[tier?.tier] || colors['Genesis']
                         })()
                       }}
                  >
                    {/* Main content */}
                    <div>
                      <div className="text-sm font-medium opacity-90">Genesis</div>
                      <div className="text-3xl font-bold">#{tokenId}</div>
                      <div className="text-xs opacity-80 mt-1">{getTierForNFT(tokenId)?.tier || 'Genesis'}</div>
                      <div className="text-sm font-semibold mt-2">{getPriceForNFT(tokenId)} ETH</div>
                    </div>
                  </div>
                  
                  {/* NFT Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
                    <div className="text-xs font-semibold">#{tokenId}</div>
                    <div className="text-xs text-yellow-400">{price} ETH</div>
                    <div className="text-xs">
                      {isSold ? 'Sold' : isAvailable ? 'Buy Now' : 'Soon'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleGenesisPurchase