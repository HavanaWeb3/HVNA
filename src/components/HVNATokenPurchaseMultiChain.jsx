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
  TrendingUp,
  Info
} from 'lucide-react'
import EmailCaptureDialog from './EmailCaptureDialog.jsx'
import TokenHoldingsDashboard from './TokenHoldingsDashboard.jsx'
import ChainSelector from './ChainSelector.jsx'
import PaymentTokenSelector from './PaymentTokenSelector.jsx'
import {
  CHAIN_IDS,
  getPresaleAddress,
  getUSDTAddress,
  getChainName,
  toHexChainId,
  formatChainForWallet,
  getNativeTokenSymbol
} from '@/config/chains.js'

const HVNATokenPurchaseMultiChain = () => {
  console.log('DEBUG: HVNATokenPurchaseMultiChain component loaded')

  // Multi-chain state
  const [selectedChainId, setSelectedChainId] = useState(CHAIN_IDS.BASE) // Default to Base
  const [currentChainId, setCurrentChainId] = useState(null)
  const [selectedToken, setSelectedToken] = useState('ETH')

  // Wallet state
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [purchaseStatus, setPurchaseStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState('0')

  // Token state
  const [tokenAmount, setTokenAmount] = useState('1000')
  const [isGenesisHolder, setIsGenesisHolder] = useState(false)
  const [purchasedTokens, setPurchasedTokens] = useState('0')
  const [tokensSold, setTokensSold] = useState('0')
  const [saleProgress, setSaleProgress] = useState(0)

  // USDT state
  const [usdtBalance, setUsdtBalance] = useState('0')
  const [usdtApproved, setUsdtApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  // UI state
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [showHoldings, setShowHoldings] = useState(false)

  // Marketing minimum
  const MARKETING_MINIMUM_TOKENS = 1650000

  // Contract addresses
  const TOKEN_CONTRACT = "0xb5561D071b39221239a56F0379a6bb96C85fb94f"
  const GENESIS_NFT_CONTRACT = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"

  // Pricing tiers
  const PRICING_TIERS = [
    { tokens: "0 - 5M", price: 0.01, status: "LIVE NOW" },
    { tokens: "5M - 10M", price: 0.05, status: "Next Tier" },
    { tokens: "10M - 15M", price: 0.10, status: "Next Tier" },
    { tokens: "15M - 20M", price: 0.15, status: "Next Tier" },
    { tokens: "20M - 25M", price: 0.30, status: "Final Tier" }
  ]

  // Load sale progress on mount
  useEffect(() => {
    if (window.ethereum) {
      checkTokensSold()
    }
  }, [])

  // Check for existing wallet connection
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          // Get current chain
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setCurrentChainId(parseInt(chainId, 16))

          // Get connected accounts
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          })

          if (accounts && accounts.length > 0) {
            const connectedWallet = accounts[0]
            console.log('DEBUG: Auto-connecting to wallet:', connectedWallet)

            // Security check
            if (connectedWallet.toLowerCase().endsWith('a0a5')) {
              console.warn('SECURITY: Blocked compromised wallet connection')
              setPurchaseStatus('⚠️ Compromised wallet detected - please switch to secure wallet')
              return
            }

            setUserAddress(connectedWallet)
            setIsConnected(true)
            setPurchaseStatus('✅ Wallet reconnected!')

            await updateUserInfo(connectedWallet)
          }
        } catch (error) {
          console.error('Failed to check existing connection:', error)
        }
      }
    }

    checkExistingConnection()

    // Listen for chain changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        setCurrentChainId(parseInt(chainId, 16))
        window.location.reload() // Recommended by MetaMask
      })

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsConnected(false)
          setUserAddress('')
        } else {
          setUserAddress(accounts[0])
          updateUserInfo(accounts[0])
        }
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged')
        window.ethereum.removeAllListeners('accountsChanged')
      }
    }
  }, [])

  // Update balances when chain or token changes
  useEffect(() => {
    if (isConnected && userAddress) {
      updateUserInfo(userAddress)
    }
  }, [selectedChainId, selectedToken])

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

        // Security check
        if (connectedWallet.toLowerCase().endsWith('a0a5')) {
          console.warn('SECURITY: Manual connection blocked for compromised wallet')
          setPurchaseStatus('🚫 Compromised wallet detected! Please switch to a secure wallet before connecting.')
          setIsLoading(false)
          return
        }

        setUserAddress(connectedWallet)
        setIsConnected(true)
        setPurchaseStatus('✅ Wallet connected successfully!')

        // Get current chain
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        setCurrentChainId(parseInt(chainId, 16))

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

  const switchNetwork = async (chainId) => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHexChainId(chainId) }],
      })
      setCurrentChainId(chainId)
      setPurchaseStatus(`✅ Switched to ${getChainName(chainId)}`)
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [formatChainForWallet(chainId)]
          })
          setCurrentChainId(chainId)
          setPurchaseStatus(`✅ Added and switched to ${getChainName(chainId)}`)
        } catch (addError) {
          console.error('Failed to add network:', addError)
          setPurchaseStatus(`❌ Failed to add ${getChainName(chainId)}`)
        }
      } else {
        console.error('Failed to switch network:', error)
        setPurchaseStatus(`❌ Failed to switch to ${getChainName(chainId)}`)
      }
    }
  }

  const updateUserInfo = async (address) => {
    try {
      console.log('DEBUG: updateUserInfo called with address:', address)

      // Get native token (ETH/BNB) balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })

      const balanceNative = parseInt(balance, 16) / Math.pow(10, 18)
      setUserBalance(balanceNative.toFixed(4))

      // Check Genesis NFT holder status (only on Base)
      if (currentChainId === CHAIN_IDS.BASE || selectedChainId === CHAIN_IDS.BASE) {
        await checkGenesisHolder(address)
      }

      // Check purchased token amount
      await checkPurchasedTokens(address)

      // If USDT selected, check USDT balance and approval
      if (selectedToken === 'USDT') {
        await checkUSDTBalance(address)
        await checkUSDTApproval(address)
      }

    } catch (error) {
      console.error('Failed to update user info:', error)
    }
  }

  const checkGenesisHolder = async (address) => {
    try {
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

  const checkTokensSold = async () => {
    try {
      const presaleAddress = getPresaleAddress(CHAIN_IDS.BASE) // Always check Base for total
      const tokensSoldSignature = "0xd96a094a"

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: presaleAddress,
          data: tokensSoldSignature
        }, 'latest']
      })

      const sold = parseInt(result, 16)
      const formattedSold = (sold / Math.pow(10, 18)).toFixed(0)
      const displaySold = Math.max(parseFloat(formattedSold), MARKETING_MINIMUM_TOKENS)

      setTokensSold(displaySold.toString())

      const progressPercent = (displaySold / 25000000) * 100
      setSaleProgress(Math.min(progressPercent, 100))

      console.log('DEBUG: Tokens sold:', formattedSold, '(Display:', displaySold, progressPercent.toFixed(2) + '%)')
    } catch (error) {
      console.error('Error checking tokens sold:', error)
      setTokensSold(MARKETING_MINIMUM_TOKENS.toString())
      setSaleProgress((MARKETING_MINIMUM_TOKENS / 25000000) * 100)
    }
  }

  const checkPurchasedTokens = async (address) => {
    console.log('=== FETCHING PURCHASED TOKENS (Event Logs) ===')
    console.log('User address:', address)
    console.log('Chain ID:', selectedChainId)

    try {
      const presaleAddress = getPresaleAddress(selectedChainId)
      console.log('Presale contract:', presaleAddress)

      if (!presaleAddress || presaleAddress === "0x0000000000000000000000000000000000000000") {
        console.log('❌ No presale contract for this chain')
        setPurchasedTokens("0")
        return
      }

      // Use Alchemy Base RPC - more reliable than public RPC
      const rpcUrl = 'https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b'

      // TokensPurchased event signature
      // event TokensPurchased(address indexed buyer, uint256 amount, uint256 costETH, uint256 costUSD, Phase phase, bool isGenesis)
      const tokensPurchasedTopic = '0xf176dd17ecd7370c4b9ac72d398444b0d6dae41877e8a3587f104b4f1bfc5007'

      // Encode user address as topic (indexed parameter)
      const userTopic = '0x' + address.slice(2).padStart(64, '0')

      console.log('Fetching event logs...')

      // Fetch event logs for this user from this contract
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getLogs',
          params: [{
            address: presaleAddress,
            topics: [
              tokensPurchasedTopic, // Event signature
              userTopic             // Buyer address (indexed)
            ],
            fromBlock: '0x0',      // From genesis
            toBlock: 'latest'       // To current block
          }],
          id: 1,
        }),
      })

      const result = await response.json()

      if (result.error) {
        console.error('❌ Error fetching logs:', result.error.message)
        setPurchasedTokens("0")
        return
      }

      const logs = result.result
      console.log(`Found ${logs.length} purchase event(s)`)

      if (logs.length === 0) {
        console.log('No purchases found')
        setPurchasedTokens("0")
        return
      }

      // Parse each log and sum up tokens
      let totalTokens = 0
      for (const log of logs) {
        try {
          // Data contains: amount, costETH, costUSD, phase, isGenesis
          // First 32 bytes (64 hex chars) after 0x is the token amount
          const tokenAmountHex = '0x' + log.data.slice(2, 66)
          const tokens = Number(BigInt(tokenAmountHex)) / 1e18

          console.log(`📦 Purchase: ${tokens} tokens (tx: ${log.transactionHash})`)
          totalTokens += tokens
        } catch (parseError) {
          console.error('⚠️ Could not parse log:', parseError.message)
        }
      }

      const formattedPurchased = totalTokens.toFixed(0)
      setPurchasedTokens(formattedPurchased === '0' ? '0' : parseInt(formattedPurchased).toLocaleString('en-US'))
      console.log('✅ Total purchased tokens:', formattedPurchased)
      console.log('=== FETCH COMPLETE ===')

    } catch (error) {
      console.error('❌ Error checking purchased tokens:', error)
      setPurchasedTokens("0")
    }
  }

  const checkUSDTBalance = async (address) => {
    try {
      const usdtAddress = getUSDTAddress(selectedChainId)
      if (!usdtAddress || usdtAddress === "0x0000000000000000000000000000000000000000") {
        setUsdtBalance("0")
        return
      }

      const balanceOfSignature = "0x70a08231"
      const addressParam = address.slice(2).padStart(64, '0')
      const data = balanceOfSignature + addressParam

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: usdtAddress, data: data }, 'latest']
      })

      const balance = parseInt(result, 16)
      // USDT has 6 decimals on Ethereum/Base, 18 on BSC
      const decimals = selectedChainId === CHAIN_IDS.BSC ? 18 : 6
      const formattedBalance = (balance / Math.pow(10, decimals)).toFixed(2)
      setUsdtBalance(formattedBalance)
    } catch (error) {
      console.error('Error checking USDT balance:', error)
      setUsdtBalance("0")
    }
  }

  const checkUSDTApproval = async (address) => {
    try {
      const usdtAddress = getUSDTAddress(selectedChainId)
      const presaleAddress = getPresaleAddress(selectedChainId)

      if (!usdtAddress || usdtAddress === "0x0000000000000000000000000000000000000000") {
        setUsdtApproved(false)
        return
      }

      // allowance(address,address)
      const allowanceSignature = "0xdd62ed3e"
      const ownerParam = address.slice(2).padStart(64, '0')
      const spenderParam = presaleAddress.slice(2).padStart(64, '0')
      const data = allowanceSignature + ownerParam + spenderParam

      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{ to: usdtAddress, data: data }, 'latest']
      })

      const allowance = parseInt(result, 16)
      const decimals = selectedChainId === CHAIN_IDS.BSC ? 18 : 6
      const minAllowance = 10 * Math.pow(10, decimals) // At least $10 worth

      setUsdtApproved(allowance >= minAllowance)
      console.log('DEBUG: USDT approved:', allowance >= minAllowance, 'allowance:', allowance)
    } catch (error) {
      console.error('Error checking USDT approval:', error)
      setUsdtApproved(false)
    }
  }

  const approveUSDT = async () => {
    if (!isConnected) {
      setPurchaseStatus('❌ Please connect your wallet first')
      return
    }

    try {
      setIsApproving(true)
      setPurchaseStatus('🔄 Requesting USDT approval...')

      const usdtAddress = getUSDTAddress(selectedChainId)
      const presaleAddress = getPresaleAddress(selectedChainId)

      // approve(address,uint256)
      const approveSignature = "0x095ea7b3"
      const spenderParam = presaleAddress.slice(2).padStart(64, '0')
      // Approve enough for max purchase ($10,000)
      const decimals = selectedChainId === CHAIN_IDS.BSC ? 18 : 6
      const approvalAmount = (10000 * Math.pow(10, decimals)).toString(16).padStart(64, '0')
      const data = approveSignature + spenderParam + approvalAmount

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: usdtAddress,
          data: data
        }]
      })

      setPurchaseStatus('🔄 Approval transaction submitted: ' + txHash)

      const receipt = await waitForTransaction(txHash)

      if (receipt && receipt.status === '0x1') {
        setPurchaseStatus('✅ USDT approved successfully! You can now purchase tokens.')
        setUsdtApproved(true)
      } else {
        setPurchaseStatus('❌ Approval transaction failed')
      }

    } catch (error) {
      console.error('Approval error:', error)
      setPurchaseStatus('❌ Approval failed: ' + error.message)
    } finally {
      setIsApproving(false)
    }
  }

  const calculateCost = () => {
    if (!tokenAmount) return '0'

    const tokens = parseFloat(tokenAmount)
    const pricePerTokenUSD = isGenesisHolder ? 0.007 : 0.01
    const totalCostUSD = tokens * pricePerTokenUSD

    if (selectedToken === 'USDT') {
      return totalCostUSD.toFixed(2)
    }

    // For ETH/BNB, estimate based on current price (contract will use Chainlink)
    const nativePrice = selectedChainId === CHAIN_IDS.BSC ? 600 : 3500 // Conservative estimate
    const estimatedNative = totalCostUSD / nativePrice

    // Add 50% buffer to account for price volatility and ensure transaction success
    return (estimatedNative * 1.5).toFixed(6)
  }

  const purchaseTokens = async () => {
    if (!isConnected) {
      setPurchaseStatus('❌ Please connect your wallet first')
      return
    }

    if (currentChainId !== selectedChainId) {
      setPurchaseStatus(`❌ Please switch to ${getChainName(selectedChainId)} network`)
      return
    }

    if (!tokenAmount || parseFloat(tokenAmount) < 1000) {
      setPurchaseStatus('❌ Minimum purchase is 1,000 $HVNA tokens')
      return
    }

    // Handle USDT purchase
    if (selectedToken === 'USDT') {
      if (!usdtApproved) {
        setPurchaseStatus('❌ Please approve USDT spending first')
        return
      }
      await purchaseWithUSDT()
    } else {
      await purchaseWithNative()
    }
  }

  const purchaseWithNative = async () => {
    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Initiating token purchase...')

      const presaleAddress = getPresaleAddress(selectedChainId)
      const tokenAmountWei = `0x${Math.floor(parseFloat(tokenAmount) * Math.pow(10, 18)).toString(16)}`
      const costNative = calculateCost()
      const costWei = `0x${Math.floor(parseFloat(costNative) * Math.pow(10, 18)).toString(16)}`

      console.log('ESTIMATED COST: Sending', costNative, getNativeTokenSymbol(selectedChainId), 'for', tokenAmount, 'tokens')

      // buyTokens(uint256)
      const buyTokensSignature = "0x3610724e"
      const tokenParam = tokenAmountWei.slice(2).padStart(64, '0')
      const data = buyTokensSignature + tokenParam

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: presaleAddress,
          data: data,
          value: costWei
        }]
      })

      setPurchaseStatus('🔄 Transaction submitted: ' + txHash)

      const receipt = await waitForTransaction(txHash)

      if (receipt && receipt.status === '0x1') {
        setPurchaseStatus('🎉 $HVNA tokens purchased successfully!')
        await updateUserInfo(userAddress)
        setShowEmailCapture(true)
      } else {
        setPurchaseStatus('❌ Transaction failed')
      }

    } catch (error) {
      setPurchaseStatus('❌ Purchase failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseWithUSDT = async () => {
    try {
      setIsLoading(true)
      setPurchaseStatus('🔄 Initiating USDT purchase...')

      const presaleAddress = getPresaleAddress(selectedChainId)
      const tokenAmountWei = `0x${Math.floor(parseFloat(tokenAmount) * Math.pow(10, 18)).toString(16)}`

      // buyTokensWithUSDT(uint256) - function signature would be calculated from ABI
      // For now, using the standard buyTokens for Base compatibility
      const buyTokensSignature = "0x3610724e"
      const tokenParam = tokenAmountWei.slice(2).padStart(64, '0')
      const data = buyTokensSignature + tokenParam

      setPurchaseStatus('💡 Note: USDT purchases will be available when multi-chain contracts are deployed')
      setIsLoading(false)
      return

      // Uncomment when multi-chain contracts are deployed
      /*
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: presaleAddress,
          data: data,
          value: '0x0' // No ETH sent for USDT purchases
        }]
      })

      setPurchaseStatus('🔄 Transaction submitted: ' + txHash)

      const receipt = await waitForTransaction(txHash)

      if (receipt && receipt.status === '0x1') {
        setPurchaseStatus('🎉 $HVNA tokens purchased with USDT successfully!')
        await updateUserInfo(userAddress)
        setShowEmailCapture(true)
      } else {
        setPurchaseStatus('❌ Transaction failed')
      }
      */

    } catch (error) {
      setPurchaseStatus('❌ Purchase failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

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

  const getBalances = () => {
    const balances = {}
    const nativeSymbol = getNativeTokenSymbol(selectedChainId)
    balances[nativeSymbol] = userBalance
    if (selectedToken === 'USDT') {
      balances['USDT'] = usdtBalance
    }
    return balances
  }

  const getEstimatedCosts = () => {
    const costs = {}
    const nativeSymbol = getNativeTokenSymbol(selectedChainId)
    if (selectedToken === nativeSymbol) {
      costs[nativeSymbol] = calculateCost()
    } else if (selectedToken === 'USDT') {
      costs['USDT'] = calculateCost()
    }
    return costs
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Coins className="h-10 w-10 text-yellow-400" />
          $HVNA Token Presale - Multi-Chain
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Buy $HVNA tokens on Ethereum, BSC, or Base with ETH, BNB, or USDT.
          Genesis NFT holders get exclusive 30% discount!
        </p>
      </div>

      {/* Multi-Chain Notice */}
      <Card className="bg-gradient-to-r from-blue-900/40 to-green-900/40 border-green-500/50 backdrop-blur-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-3">
            <div className="bg-green-500/20 rounded-full p-2">
              <Info className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-white font-bold text-lg mb-2">🌐 Multi-Chain Support Available!</h3>
              <p className="text-gray-200 leading-relaxed">
                Choose your preferred blockchain network and payment method. Pay with <strong className="text-green-400">ETH on Ethereum</strong>,{' '}
                <strong className="text-yellow-400">BNB on BSC</strong>, or <strong className="text-blue-400">ETH on Base</strong>.
                USDT support coming soon! All purchases vest equally regardless of payment method.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Selector */}
      <ChainSelector
        currentChainId={currentChainId}
        selectedChainId={selectedChainId}
        onChainSelect={setSelectedChainId}
        onSwitchNetwork={switchNetwork}
        isConnected={isConnected}
      />

      {/* Trust & Credibility */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Verified Token Contract</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Official $HVNA token with multi-chain presale support. ERC-20 standard with full utility integration.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                <span>View on Block Explorer</span>
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

      {/* Wallet Connection */}
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
                Network: {getChainName(currentChainId)} (Chain ID: {currentChainId})
              </div>
              <div className="text-gray-300">
                Balance: {userBalance} {getNativeTokenSymbol(currentChainId)}
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
                  <button
                    onClick={() => setShowHoldings(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-bold hover:scale-105 transition mt-3"
                  >
                    📊 View My $HVNA Holdings
                  </button>
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

      {/* Payment Token Selector */}
      {isConnected && (
        <PaymentTokenSelector
          selectedChainId={selectedChainId}
          selectedToken={selectedToken}
          onTokenSelect={setSelectedToken}
          balances={getBalances()}
          usdtApproved={usdtApproved}
          estimatedCosts={getEstimatedCosts()}
          isConnected={isConnected}
        />
      )}

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
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow values >= 1000 or empty
                  if (value === '' || parseFloat(value) >= 1000) {
                    setTokenAmount(value);
                  } else if (parseFloat(value) > 0) {
                    // If user enters less than 1000, set to 1000
                    setTokenAmount('1000');
                    setPurchaseStatus('⚠️ Minimum purchase is 1,000 tokens - adjusted automatically');
                  }
                }}
                min="1000"
                step="1000"
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
                  <span className="text-gray-300">Payment Method:</span>
                  <span className="text-white font-semibold">{selectedToken} on {getChainName(selectedChainId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cost in {selectedToken}:</span>
                  <span className="text-green-400 font-bold">{calculateCost()} {selectedToken}</span>
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

            {/* Network Mismatch Warning */}
            {currentChainId !== selectedChainId && (
              <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <span className="text-orange-300">
                    Please switch to {getChainName(selectedChainId)} network to purchase
                  </span>
                </div>
                <Button
                  onClick={() => switchNetwork(selectedChainId)}
                  className="mt-2 w-full bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  Switch to {getChainName(selectedChainId)}
                </Button>
              </div>
            )}

            {/* USDT Approval */}
            {selectedToken === 'USDT' && !usdtApproved && (
              <div className="space-y-2">
                <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-300">
                      USDT approval required before purchase (one-time transaction)
                    </span>
                  </div>
                </div>
                <Button
                  onClick={approveUSDT}
                  disabled={isApproving || currentChainId !== selectedChainId}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Approving USDT...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Approve USDT Spending
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              onClick={purchaseTokens}
              disabled={
                isLoading ||
                !tokenAmount ||
                parseFloat(tokenAmount) < 1000 ||
                currentChainId !== selectedChainId ||
                (selectedToken === 'USDT' && !usdtApproved)
              }
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
                  Buy {parseFloat(tokenAmount || 0).toLocaleString()} $HVNA with {selectedToken}
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

      {/* Holdings Dashboard Modal */}
      <TokenHoldingsDashboard
        isOpen={showHoldings}
        onClose={() => setShowHoldings(false)}
        userAddress={userAddress}
        selectedChainId={selectedChainId}
      />
    </div>
  )
}

export default HVNATokenPurchaseMultiChain
