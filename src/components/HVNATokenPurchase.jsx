import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Coins, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Shield,
  Star,
  Crown,
  Calculator,
  TrendingUp
} from 'lucide-react'

const HVNATokenPurchase = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [purchaseStatus, setPurchaseStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState('0')
  const [tokenAmount, setTokenAmount] = useState('1000')
  const [isGenesisHolder, setIsGenesisHolder] = useState(false)
  const [purchasedTokens, setPurchasedTokens] = useState('0')

  // Contract addresses - deployed on Base mainnet
  const TOKEN_CONTRACT = "0x9B2c154C8B6B1826Df60c81033861891680EBFab"
  const PRESALE_CONTRACT = "0x834E1f85Aab642Ecc31D87dc48cE32D93CecC70E" // NEW: FULLY FIXED pricing contract
  const GENESIS_NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setPurchaseStatus('❌ MetaMask not installed. Please install MetaMask extension.')
      return
    }

    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Requesting wallet connection...')
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0])
        setIsConnected(true)
        setPurchaseStatus('✅ Wallet connected successfully!')
        
        await updateUserInfo(accounts[0])
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

      // Check Genesis NFT holder status
      await checkGenesisHolder(address)
      
      // Check purchased token amount
      await checkPurchasedTokens(address)
      
    } catch (error) {
      console.error('Failed to update user info:', error)
    }
  }

  // Check if user owns Genesis NFT
  const checkGenesisHolder = async (address) => {
    try {
      // balanceOf(address)
      const balanceOfSignature = "0x70a08231"
      const addressParam = address.slice(2).padStart(64, '0')
      const data = balanceOfSignature + addressParam

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: GENESIS_NFT_CONTRACT, data: data }, 'latest']
      })

      const balance = parseInt(result, 16)
      setIsGenesisHolder(balance > 0)
    } catch (error) {
      console.error('Failed to check Genesis holder status:', error)
    }
  }

  // Check purchased token amount from presale contract
  const checkPurchasedTokens = async (address) => {
    try {
      // purchasedAmount(address) function signature
      const purchasedAmountSignature = "0x8f75aa12"
      const addressParam = address.slice(2).padStart(64, '0')
      const data = purchasedAmountSignature + addressParam

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: PRESALE_CONTRACT, data: data }, 'latest']
      })

      const purchasedWei = parseInt(result, 16)
      const purchasedTokens = purchasedWei / Math.pow(10, 18)
      setPurchasedTokens(purchasedTokens.toLocaleString())
    } catch (error) {
      console.error('Failed to check purchased tokens:', error)
      setPurchasedTokens('0')
    }
  }

  // Calculate purchase cost - FIXED CONTRACT with correct pricing
  const calculateCost = () => {
    if (!tokenAmount) return '0'
    
    // FIXED: Contract now has correct pricing calculation
    const tokens = parseFloat(tokenAmount)
    const pricePerTokenUSD = isGenesisHolder ? 0.007 : 0.01 // Correct USD per token
    const totalCostUSD = tokens * pricePerTokenUSD
    
    // Convert USD to ETH at current rate (~$4000 per ETH)
    const ethPrice = 4000
    const totalCostETH = totalCostUSD / ethPrice
    
    return totalCostETH.toFixed(6)
  }

  // Purchase tokens
  const purchaseTokens = async () => {
    if (!isConnected) {
      setPurchaseStatus('❌ Please connect your wallet first')
      return
    }

    if (!tokenAmount || parseFloat(tokenAmount) < 1000) {
      setPurchaseStatus('❌ Minimum purchase is 1,000 $HVNA tokens')
      return
    }

    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Initiating token purchase...')

      // Ensure we're on Base network
      await ensureBaseNetwork()
      setPurchaseStatus('🔄 Network verified, purchasing tokens...')

      const tokenAmountWei = `0x${Math.floor(parseFloat(tokenAmount) * Math.pow(10, 18)).toString(16)}`
      const costETH = calculateCost() // This is the CORRECT cost from the fixed contract
      const costWei = `0x${Math.floor(parseFloat(costETH) * Math.pow(10, 18)).toString(16)}`
      
      console.log('FIXED CONTRACT: Sending', costETH, 'ETH for', tokenAmount, 'tokens (correct pricing!)')

      // Call buyTokens(uint256) function
      const buyTokensSignature = "0x3610724e" // buyTokens(uint256)
      const tokenParam = tokenAmountWei.slice(2).padStart(64, '0')
      const data = buyTokensSignature + tokenParam

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: PRESALE_CONTRACT,
          data: data,
          value: costWei
        }]
      })

      setPurchaseStatus('🔄 Transaction submitted: ' + txHash)
      
      // Wait for confirmation
      const receipt = await waitForTransaction(txHash)
      
      if (receipt && receipt.status === '0x1') {
        setPurchaseStatus('🎉 $HVNA tokens purchased successfully!')
        await updateUserInfo(userAddress) // Refresh user info including purchased tokens
      } else {
        setPurchaseStatus('❌ Transaction failed')
      }

    } catch (error) {
      setPurchaseStatus('❌ Purchase failed: ' + error.message)
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Coins className="h-10 w-10 text-yellow-400" />
          $HVNA Token Presale
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Join the HVNA ecosystem with utility tokens that provide real-world benefits. 
          Genesis NFT holders get exclusive 30% discount!
        </p>
      </div>

      {/* Trust & Credibility */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Verified Token Contract</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Official $HVNA token deployed on Base network. ERC-20 standard with full utility integration.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>View on BaseScan</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Contract: {TOKEN_CONTRACT.slice(0, 6)}...{TOKEN_CONTRACT.slice(-4)}</span>
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
              <p className="text-gray-300">Connect your wallet to participate in the $HVNA token presale</p>
              <Button 
                onClick={connectWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                {isLoading ? 'Connecting...' : '🔗 Connect MetaMask'}
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
              <div className="text-yellow-400 font-semibold">
                $HVNA Tokens Purchased: {purchasedTokens}
              </div>
              {isGenesisHolder && (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400">Genesis NFT Holder - 30% Discount!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Interface */}
      {isConnected && (
        <Card className="bg-slate-900/50 border-yellow-500/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Purchase $HVNA Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token Amount (Minimum: 1,000 $HVNA)
              </label>
              <input 
                type="number" 
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                min="1000"
                step="100"
                className="w-full px-4 py-3 bg-slate-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg"
                placeholder="1000"
              />
            </div>

            {/* Purchase Summary */}
            <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Purchase Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Tokens:</span>
                  <span className="text-white font-semibold">{parseFloat(tokenAmount || 0).toLocaleString()} $HVNA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price per Token:</span>
                  <span className="text-white">{isGenesisHolder ? '$0.007' : '$0.01'} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cost in ETH:</span>
                  <span className="text-green-400 font-bold">{calculateCost()} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Cost USD:</span>
                  <span className="text-green-400">${(parseFloat(tokenAmount || 0) * (isGenesisHolder ? 0.007 : 0.01)).toFixed(2)}</span>
                </div>
                {isGenesisHolder && (
                  <div className="text-center pt-2 border-t border-gray-600">
                    <span className="text-yellow-400 text-sm font-semibold">
                      🎉 Genesis Discount Applied: 30% Off!
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={purchaseTokens}
              disabled={isLoading || !tokenAmount || parseFloat(tokenAmount) < 1000}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg py-6 disabled:opacity-50"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-5 w-5" />
                  Buy {parseFloat(tokenAmount || 0).toLocaleString()} $HVNA Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

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

      {/* Token Benefits */}
      <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-400" />
            $HVNA Token Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Immediate Benefits</h4>
              <ul className="space-y-2">
                <li>• <strong className="text-yellow-400">Product Discounts</strong> up to 30%</li>
                <li>• <strong className="text-purple-400">Early Access</strong> to new products</li>
                <li>• <strong className="text-pink-400">Exclusive Drops</strong> and limited editions</li>
                <li>• <strong className="text-blue-400">VIP Community</strong> access</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Future Utility</h4>
              <ul className="space-y-2">
                <li>• <strong className="text-green-400">ContentLynk Access</strong> to social platform</li>
                <li>• <strong className="text-orange-400">Governance Rights</strong> in ecosystem decisions</li>
                <li>• <strong className="text-red-400">Staking Rewards</strong> for passive income</li>
                <li>• <strong className="text-cyan-400">Partnership Benefits</strong> with other brands</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Tiers */}
      <Card className="bg-slate-900/50 border-green-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Token Holder Discount Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-2">10%</div>
              <div className="text-white font-semibold mb-1">Bronze Tier</div>
              <div className="text-sm text-gray-400">€150+ Token Holdings</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-2">20%</div>
              <div className="text-white font-semibold mb-1">Silver Tier</div>
              <div className="text-sm text-gray-400">€250+ Token Holdings</div>
            </div>
            <div className="text-center p-4 bg-slate-800/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-2">30%</div>
              <div className="text-white font-semibold mb-1">Gold Tier</div>
              <div className="text-sm text-gray-400">€500+ Token Holdings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HVNATokenPurchase