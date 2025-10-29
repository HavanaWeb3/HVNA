import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react'
import { getAllSupportedChains, getChainName, toHexChainId } from '@/config/chains.js'

/**
 * ChainSelector Component
 *
 * Allows users to select which blockchain network to use for purchasing tokens.
 * Supports Ethereum, BSC, and Base networks with visual indicators for:
 * - Current wallet network
 * - Gas fee tiers
 * - Supported payment tokens
 * - Network switching
 *
 * @param {object} props
 * @param {number} props.currentChainId - Currently connected wallet chain ID
 * @param {number} props.selectedChainId - User's selected chain for purchase
 * @param {function} props.onChainSelect - Callback when user selects a chain
 * @param {function} props.onSwitchNetwork - Callback to switch wallet network
 * @param {boolean} props.isConnected - Whether wallet is connected
 */
const ChainSelector = ({
  currentChainId,
  selectedChainId,
  onChainSelect,
  onSwitchNetwork,
  isConnected
}) => {
  const [isSwitching, setIsSwitching] = useState(false)
  const supportedChains = getAllSupportedChains()

  const handleChainClick = async (chainId) => {
    // If not connected, just select the chain (wallet will switch on connect)
    if (!isConnected) {
      onChainSelect(chainId)
      return
    }

    // If already on this chain, just select it
    if (currentChainId === chainId) {
      onChainSelect(chainId)
      return
    }

    // Otherwise, need to switch network
    setIsSwitching(true)
    try {
      await onSwitchNetwork(chainId)
      onChainSelect(chainId)
    } catch (error) {
      console.error('Failed to switch network:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  const isCurrentChain = (chainId) => isConnected && currentChainId === chainId
  const isSelected = (chainId) => selectedChainId === chainId

  return (
    <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Select Network
            </h3>
            {isConnected && (
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                Connected to {getChainName(currentChainId)}
              </Badge>
            )}
          </div>

          <div className="grid gap-3">
            {supportedChains.map((chain) => {
              const isActive = isCurrentChain(chain.id)
              const isChosen = isSelected(chain.id)
              const needsSwitch = isConnected && !isActive && isChosen

              return (
                <button
                  key={chain.id}
                  onClick={() => handleChainClick(chain.id)}
                  disabled={isSwitching}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${isChosen
                      ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-yellow-400 shadow-lg shadow-yellow-400/20'
                      : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'
                    }
                    ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Chain Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl mt-1">{chain.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold text-lg">{chain.name}</h4>
                          {isActive && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/50 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                          {isChosen && !isActive && isConnected && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/50 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Switch Required
                            </Badge>
                          )}
                        </div>

                        {/* Payment Tokens */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-400 text-sm">Pay with:</span>
                          <div className="flex gap-1.5">
                            {chain.paymentTokens.map((token) => (
                              <Badge
                                key={token}
                                variant="outline"
                                className="text-xs bg-slate-700/50 text-white border-slate-600"
                              >
                                {token}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Gas Fee Info */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Gas fees:</span>
                          <span
                            className={`font-semibold ${
                              chain.gasFeeTier === 'low'
                                ? 'text-green-400'
                                : chain.gasFeeTier === 'medium'
                                ? 'text-yellow-400'
                                : 'text-orange-400'
                            }`}
                          >
                            {chain.avgGasFee}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 text-xs">{chain.bestFor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Select/Switch Button */}
                    <div className="flex flex-col items-end gap-2">
                      {isChosen && (
                        <CheckCircle className="h-6 w-6 text-yellow-400" />
                      )}
                      {needsSwitch && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleChainClick(chain.id)
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs"
                        >
                          Switch Network
                        </Button>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Network Info Banner */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <strong>Multi-Chain Support:</strong> Buy $HVNA tokens on your preferred network.
                All purchases are tracked and tokens will be claimed on Base network where $HVNA token lives.
              </div>
            </div>
          </div>

          {/* Gas Fee Comparison */}
          <div className="mt-3 p-3 bg-slate-800/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-2 font-semibold">💡 Gas Fee Comparison</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {supportedChains.map((chain) => (
                <div key={chain.id} className="text-center">
                  <div className="text-white font-semibold mb-1">{chain.shortName}</div>
                  <div
                    className={`text-xs ${
                      chain.gasFeeTier === 'low'
                        ? 'text-green-400'
                        : chain.gasFeeTier === 'medium'
                        ? 'text-yellow-400'
                        : 'text-orange-400'
                    }`}
                  >
                    {chain.avgGasFee}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChainSelector
