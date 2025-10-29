import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'
import { PAYMENT_TOKENS, getPaymentTokensForChain } from '@/config/chains.js'

/**
 * PaymentTokenSelector Component
 *
 * Allows users to select which token to use for payment (ETH, BNB, or USDT).
 * Displays token-specific information like:
 * - Token balance
 * - Approval status (for ERC-20 tokens like USDT)
 * - Estimated costs
 * - Payment flow instructions
 *
 * @param {object} props
 * @param {number} props.selectedChainId - Currently selected chain ID
 * @param {string} props.selectedToken - Currently selected payment token symbol
 * @param {function} props.onTokenSelect - Callback when user selects a token
 * @param {object} props.balances - Token balances { ETH: '1.234', USDT: '500.00', BNB: '2.1' }
 * @param {boolean} props.usdtApproved - Whether USDT is approved for spending (if applicable)
 * @param {object} props.estimatedCosts - Cost estimates { ETH: '0.022', USDT: '100.00' }
 * @param {boolean} props.isConnected - Whether wallet is connected
 */
const PaymentTokenSelector = ({
  selectedChainId,
  selectedToken,
  onTokenSelect,
  balances = {},
  usdtApproved = false,
  estimatedCosts = {},
  isConnected
}) => {
  const availableTokens = getPaymentTokensForChain(selectedChainId)

  if (!availableTokens || availableTokens.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-red-500/20 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>No payment tokens available for selected chain</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTokenInfo = (tokenSymbol) => PAYMENT_TOKENS[tokenSymbol]

  const hasBalance = (tokenSymbol) => {
    const balance = balances[tokenSymbol]
    return balance && parseFloat(balance) > 0
  }

  const hasSufficientBalance = (tokenSymbol) => {
    const balance = balances[tokenSymbol]
    const cost = estimatedCosts[tokenSymbol]
    if (!balance || !cost) return true // Can't determine, assume true
    return parseFloat(balance) >= parseFloat(cost)
  }

  const needsApproval = (tokenSymbol) => {
    return tokenSymbol === 'USDT' && !usdtApproved
  }

  return (
    <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            💳 Payment Method
          </h3>

          {/* Token Selection */}
          <div className="grid gap-3">
            {availableTokens.map((tokenSymbol) => {
              const tokenInfo = getTokenInfo(tokenSymbol)
              const isSelected = selectedToken === tokenSymbol
              const balance = balances[tokenSymbol] || '0'
              const cost = estimatedCosts[tokenSymbol]
              const sufficient = hasSufficientBalance(tokenSymbol)
              const requiresApproval = needsApproval(tokenSymbol)

              if (!tokenInfo) return null

              return (
                <button
                  key={tokenSymbol}
                  onClick={() => onTokenSelect(tokenSymbol)}
                  disabled={!isConnected}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${isSelected
                      ? 'bg-gradient-to-r from-green-900/40 to-blue-900/40 border-green-400 shadow-lg shadow-green-400/20'
                      : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'
                    }
                    ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Token Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl mt-1">{tokenInfo.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold">{tokenInfo.name}</h4>
                          <Badge
                            variant="outline"
                            className="text-xs bg-slate-700/50 text-gray-300 border-slate-600"
                          >
                            {tokenInfo.symbol}
                          </Badge>
                          {tokenInfo.isNative && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/50 text-xs">
                              Native
                            </Badge>
                          )}
                        </div>

                        {/* Balance Info */}
                        {isConnected && (
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            <span className="text-gray-400">Balance:</span>
                            <span className={`font-semibold ${
                              hasBalance(tokenSymbol) ? 'text-white' : 'text-gray-500'
                            }`}>
                              {parseFloat(balance).toLocaleString()} {tokenInfo.symbol}
                            </span>
                            {!sufficient && cost && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-400/50 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Insufficient
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Cost Estimate */}
                        {cost && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Estimated cost:</span>
                            <span className="text-green-400 font-semibold">
                              {parseFloat(cost).toLocaleString()} {tokenInfo.symbol}
                            </span>
                          </div>
                        )}

                        {/* USDT Approval Notice */}
                        {requiresApproval && isSelected && (
                          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-500/50 rounded text-xs">
                            <div className="flex items-start gap-2">
                              <Info className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span className="text-yellow-300">
                                USDT approval required before purchase (one-time transaction)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Payment Flow Info */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong className="block mb-1">How it works:</strong>
              {selectedToken === 'USDT' ? (
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Approve USDT spending (if not already approved)</li>
                  <li>Confirm purchase transaction</li>
                  <li>Tokens allocated to your vesting schedule</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Enter token amount you want to buy</li>
                  <li>Confirm purchase transaction with {selectedToken}</li>
                  <li>Tokens allocated to your vesting schedule</li>
                </ol>
              )}
            </div>
          </div>

          {/* Token Type Notice */}
          {!isConnected && (
            <div className="text-center text-gray-400 text-sm">
              Connect your wallet to see balances and purchase options
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PaymentTokenSelector
