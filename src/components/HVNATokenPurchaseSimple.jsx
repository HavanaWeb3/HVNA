import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Coins, Wallet, CheckCircle, AlertCircle } from 'lucide-react'

const HVNATokenPurchaseSimple = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')
  const [status, setStatus] = useState('')

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus('❌ MetaMask not installed')
      return
    }

    try {
      setStatus('🔄 Connecting...')
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0])
        setIsConnected(true)
        setStatus('✅ Connected successfully!')
      }
    } catch (error) {
      setStatus('❌ Connection failed: ' + error.message)
    }
  }

  const buyTokens = () => {
    setStatus('🚀 Token purchase functionality coming soon!')
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Coins className="h-10 w-10 text-yellow-400" />
          $HVNA Token Presale - LIVE NOW!
        </h2>
        <p className="text-xl text-gray-300">
          Buy $HVNA tokens at $0.01 each (Genesis holders: $0.007 - 30% off!)
        </p>
      </div>

      {/* Connection */}
      <Card className="bg-slate-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-gray-300">Connect your MetaMask wallet to buy tokens</p>
              <Button 
                onClick={connectWallet}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                🔗 Connect MetaMask
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white">
                  Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
              </div>
              <Button 
                onClick={buyTokens}
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold"
              >
                <Coins className="mr-2 h-4 w-4" />
                Buy $HVNA Tokens
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      {status && (
        <Card className="bg-slate-900/50 border-blue-500/20">
          <CardContent className="pt-6">
            <p className="text-white text-center">{status}</p>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-slate-900/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white">Token Information</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <ul className="space-y-2">
            <li>💰 <strong>Price:</strong> $0.01 per token</li>
            <li>👑 <strong>Genesis Discount:</strong> $0.007 per token (30% off)</li>
            <li>📊 <strong>Minimum Purchase:</strong> 1,000 tokens</li>
            <li>🔗 <strong>Network:</strong> Base Mainnet</li>
            <li>🎯 <strong>Benefits:</strong> Product discounts, governance, staking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default HVNATokenPurchaseSimple