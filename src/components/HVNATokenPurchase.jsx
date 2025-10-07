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
import EmailCaptureDialog from './EmailCaptureDialog.jsx'

const HVNATokenPurchase = () => {
  console.log('DEBUG: HVNATokenPurchase component loaded')
  
  // EMERGENCY: Contract migration in progress
  const CONTRACT_MIGRATION_MODE = false // ✅ Migration complete - secure contract deployed
  
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [purchaseStatus, setPurchaseStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState('0')
  const [tokenAmount, setTokenAmount] = useState('1000')
  const [isGenesisHolder, setIsGenesisHolder] = useState(false)
  const [purchasedTokens, setPurchasedTokens] = useState('0')
  const [tokensSold, setTokensSold] = useState('0')
  const [saleProgress, setSaleProgress] = useState(0)
  const [showEmailCapture, setShowEmailCapture] = useState(false)

  // Contract addresses - deployed on Base mainnet
  const TOKEN_CONTRACT = "0xb5561D071b39221239a56F0379a6bb96C85fb94f"
  const PRESALE_CONTRACT = "0x2cCE8fA9C5A369145319EB4906a47B319c639928" // VESTING V3: $10-$10,000 limits, 40% launch, 40% +3mo, 20% +6mo
  const GENESIS_NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"

  // Tiered pricing structure
  const PRICING_TIERS = [
    { tokens: "0 - 5M", price: 0.01, status: "LIVE NOW" },
    { tokens: "5M - 10M", price: 0.05, status: "Next Tier" },
    { tokens: "10M - 15M", price: 0.10, status: "Next Tier" },
    { tokens: "15M - 20M", price: 0.15, status: "Next Tier" },
    { tokens: "20M - 25M", price: 0.30, status: "Final Tier" }
  ]

  // Load sale progress on page load
  useEffect(() => {
    if (window.ethereum) {
      checkTokensSold()
    }
  }, [])

  // Connect wallet
  // Check for existing wallet connection on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })

          if (accounts && accounts.length > 0) {
            const connectedWallet = accounts[0]
            console.log('DEBUG: Auto-connecting to wallet:', connectedWallet)

            // SECURITY: Block compromised wallet
            if (connectedWallet.toLowerCase().endsWith('a0a5')) {
              console.warn('SECURITY: Blocked compromised wallet connection')
              setPurchaseStatus('⚠️ Compromised wallet detected - please switch to secure wallet')
              return
            }

            setUserAddress(connectedWallet)
            setIsConnected(true)
            setPurchaseStatus('✅ Wallet reconnected!')

            // Check actual token balance from new contract
            await checkPurchasedTokens(connectedWallet)
            
            await updateUserInfo(connectedWallet)
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error)
        }
      }
    }
    
    checkExistingConnection()
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      setPurchaseStatus('❌ Web3 wallet not detected. Please install MetaMask, Rabby, or another Web3 wallet.')
      return
    }

    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Requesting wallet connection...')
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts && accounts.length > 0) {
        const connectedWallet = accounts[0]
        
        // SECURITY: Block compromised wallet connection
        if (connectedWallet.toLowerCase().endsWith('a0a5')) {
          console.warn('SECURITY: Manual connection blocked for compromised wallet')
          setPurchaseStatus('🚫 Compromised wallet detected! Please switch to a secure wallet before connecting.')
          setIsLoading(false)
          return
        }
        
        setUserAddress(connectedWallet)
        setIsConnected(true)
        setPurchaseStatus('✅ Wallet connected successfully!')

        await updateUserInfo(connectedWallet)
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
      console.log('DEBUG: updateUserInfo called with address:', address)
      
      // Get ETH balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      const balanceETH = parseInt(balance, 16) / Math.pow(10, 18)
      setUserBalance(balanceETH.toFixed(4))

      // Check Genesis NFT holder status
      await checkGenesisHolder(address)

      // Check purchased token amount from vesting presale contract
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

  // Check total tokens sold from presale contract
  const checkTokensSold = async () => {
    try {
      // Call tokensSold() - function signature 0xd96a094a
      const tokensSoldSignature = "0xd96a094a"

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: PRESALE_CONTRACT,
          data: tokensSoldSignature
        }, 'latest']
      })

      const sold = parseInt(result, 16)
      const formattedSold = (sold / Math.pow(10, 18)).toFixed(0)

      setTokensSold(formattedSold)

      // Calculate progress (out of 25M tokens)
      const progressPercent = (parseFloat(formattedSold) / 25000000) * 100
      setSaleProgress(Math.min(progressPercent, 100))

      console.log('DEBUG: Tokens sold:', formattedSold, '(' + progressPercent.toFixed(2) + '%)')
    } catch (error) {
      console.error('Error checking tokens sold:', error)
    }
  }

  // Check purchased token amount from PRESALE contract (vesting)
  const checkPurchasedTokens = async (address) => {
    try {
      // Call getPurchasedTokens(address) on presale contract
      const getPurchasedSignature = "0x74be0a3f" // getPurchasedTokens(address)
      const addressParam = address.slice(2).padStart(64, '0')
      const data = getPurchasedSignature + addressParam

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: PRESALE_CONTRACT,
          data: data
        }, 'latest']
      })

      const purchased = parseInt(result, 16)
      const formattedPurchased = (purchased / Math.pow(10, 18)).toFixed(0)

      setPurchasedTokens(formattedPurchased === '0' ? '0' : parseInt(formattedPurchased).toLocaleString('en-US'))
      console.log('DEBUG: Purchased tokens (vesting):', formattedPurchased)
    } catch (error) {
      console.error('Error checking purchased tokens:', error)
      setPurchasedTokens("0")
    }
  }

  // Calculate purchase cost - contract will verify exact amount
  const calculateCost = () => {
    if (!tokenAmount) return '0'

    // Simple calculation - contract uses Chainlink for exact pricing
    // This is an estimate, contract will calculate exact ETH needed
    const tokens = parseFloat(tokenAmount)
    const pricePerTokenUSD = isGenesisHolder ? 0.007 : 0.01
    const totalCostUSD = tokens * pricePerTokenUSD
    const ethPrice = 4533 // Approximate current ETH price
    const estimatedETH = totalCostUSD / ethPrice

    // Add 10% buffer for price fluctuations and gas
    return (estimatedETH * 1.1).toFixed(6)
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
      const costETH = calculateCost() // Estimate - contract will verify exact amount
      const costWei = `0x${Math.floor(parseFloat(costETH) * Math.pow(10, 18)).toString(16)}`

      console.log('ESTIMATED COST: Sending', costETH, 'ETH for', tokenAmount, 'tokens (with 10% buffer)')

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
        setShowEmailCapture(true) // Show email capture dialog after successful purchase
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

  // Emergency contract migration mode
  if (CONTRACT_MIGRATION_MODE) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto text-center">
        <Card className="bg-red-900/30 border-red-500 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
              <h2 className="text-3xl font-bold text-red-400 mb-4">⚠️ CONTRACT MIGRATION IN PROGRESS</h2>
              <p className="text-xl text-gray-300 mb-4">
                We're upgrading our smart contract infrastructure for enhanced security.
              </p>
              <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-4 text-left">
                <h4 className="text-yellow-400 font-semibold mb-2">What's happening:</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Deploying new secure smart contract</li>
                  <li>• Enhancing wallet security infrastructure</li>
                  <li>• Token purchases temporarily suspended</li>
                  <li>• All existing purchases remain valid</li>
                </ul>
              </div>
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 font-semibold">
                  🔒 Your existing token purchases are completely secure
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  We'll resume sales shortly with bulletproof security
                </p>
              </div>
              <div className="text-gray-400 text-sm">
                Expected completion: Within 30 minutes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                    You can purchase $HVNA tokens using your regular ETH. We use the <strong className="text-green-400">Base blockchain</strong> for
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

      {/* Tiered Pricing Structure */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-yellow-500/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            Tiered Pricing Structure
          </CardTitle>
          <CardDescription className="text-gray-300">
            Price increases as tokens sell - Early buyers get best value!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PRICING_TIERS.map((tier, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  tier.status === "LIVE NOW"
                    ? "bg-yellow-900/30 border-yellow-500/50"
                    : "bg-slate-800/30 border-slate-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{tier.tokens} tokens</div>
                    <div className="text-sm text-gray-400">
                      {tier.status === "LIVE NOW" && (
                        <span className="inline-flex items-center gap-1 text-yellow-400">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                          </span>
                          {tier.status}
                        </span>
                      )}
                      {tier.status !== "LIVE NOW" && (
                        <span className="text-gray-500">{tier.status}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">${tier.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">per token</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sale Progress */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-semibold">Presale Progress</span>
              <span className="text-yellow-400 font-bold">{saleProgress.toFixed(2)}% Complete</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 transition-all duration-1000 ease-out relative"
                style={{ width: `${saleProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{parseInt(tokensSold).toLocaleString()} sold</span>
              <span className="text-gray-400">25,000,000 target</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-300">
              💡 <strong>Smart Investment:</strong> Buy now at $0.01 before the price increases to $0.05!
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
                {isLoading ? 'Connecting...' : '🔗 Connect Wallet'}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white">Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                Full address: {userAddress}
              </div>
              <div className="text-gray-300">
                Balance: {userBalance} ETH
              </div>
              {parseFloat(purchasedTokens.replace(/,/g, '')) > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-lg">
                      Purchased (Vesting): {purchasedTokens} $HVNA
                    </span>
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    Total Value: ${(parseFloat(purchasedTokens.replace(/,/g, '')) * 0.01).toFixed(2)} USD
                  </div>
                  <div className="text-yellow-300 text-xs mt-2 bg-yellow-900/20 rounded p-2">
                    🔒 Tokens locked until trading launch
                    <br />
                    📅 Vesting: 40% at launch, 40% at +3mo, 20% at +6mo
                  </div>
                </div>
              )}
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

      {/* Email Capture Dialog */}
      <EmailCaptureDialog
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        purchaseType="HVNA Token"
        walletAddress={userAddress}
      />
    </div>
  )
}

export default HVNATokenPurchase