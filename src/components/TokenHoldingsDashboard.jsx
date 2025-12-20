import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TokenHoldingsDashboard = ({ isOpen, onClose, userAddress, selectedChainId }) => {
  const [loading, setLoading] = useState(true);
  const [vestingTokens, setVestingTokens] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!isOpen || !userAddress) return;

      console.log('🎬 DASHBOARD: Fetching tokens...');
      console.log('Address:', userAddress);
      console.log('Chain:', selectedChainId);

      setLoading(true);

      try {
        // Fetch vesting tokens from transaction logs
        const presaleContract = '0x390Bdc27F8488915AC5De3fCd43c695b41f452FA';
        const tokensPurchasedTopic = '0xf176dd17ecd7370c4b9ac72d398444b0d6dae41877e8a3587f104b4f1bfc5007';
        const userTopic = '0x' + userAddress.slice(2).padStart(64, '0');

        console.log('Fetching event logs for presale purchases...');

        const response = await fetch('https://base-mainnet.g.alchemy.com/v2/kQ_AMlblmucAHHwcH5o-b', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getLogs',
            params: [{
              fromBlock: '0x0',
              toBlock: 'latest',
              address: presaleContract,
              topics: [
                tokensPurchasedTopic, // TokensPurchased event signature
                userTopic             // Buyer address (indexed)
              ]
            }],
            id: 1
          })
        });

        const result = await response.json();
        console.log('Dashboard logs response:', result);

        if (result.result && result.result.length > 0) {
          let total = 0;
          result.result.forEach(log => {
            const hexAmount = '0x' + log.data.slice(2, 66);
            const amount = Number(BigInt(hexAmount)) / 1e18;
            total += amount;
            console.log('📦 Dashboard found purchase:', amount, 'tokens');
          });
          setVestingTokens(total);
          console.log('✅ Dashboard total vesting:', total);
        } else {
          console.log('⚠️ Dashboard: No purchase logs found');
        }

      } catch (error) {
        console.error('❌ Dashboard error fetching tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [isOpen, userAddress, selectedChainId]);

  if (!isOpen) return null;

  const totalHoldings = tokenBalance + vestingTokens;
  const tokenPrice = 0.01; // Current price

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🪙 Your $HVNA Holdings
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-6xl mb-4">🔄</div>
              <p className="text-gray-400">Loading your holdings...</p>
            </div>
          ) : totalHoldings === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2 text-white">No $HVNA Tokens Yet</h3>
              <p className="text-gray-400 mb-6">
                Start your journey to financial freedom! Purchase $HVNA tokens to unlock exclusive benefits.
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition"
              >
                Buy $HVNA Tokens
              </button>
            </div>
          ) : (
            <div>
              {/* Total Holdings */}
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg p-6 mb-6">
                <h3 className="text-white text-lg mb-2">Total Holdings</h3>
                <div className="text-white text-4xl font-bold">
                  {totalHoldings.toLocaleString()} $HVNA
                </div>
                <div className="text-white/80 text-sm mt-2">
                  ≈ ${(totalHoldings * tokenPrice).toFixed(2)} USD
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                  <span className="text-gray-300">In Wallet (Available)</span>
                  <span className="font-bold text-white">{tokenBalance.toLocaleString()} $HVNA</span>
                </div>

                {vestingTokens > 0 && (
                  <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                    <span className="text-gray-300">🔒 Vesting (Locked)</span>
                    <span className="font-bold text-white">{vestingTokens.toLocaleString()} $HVNA</span>
                  </div>
                )}
              </div>

              {/* Vesting Schedule */}
              {vestingTokens > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-bold mb-2">📅 Vesting Schedule</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• 40% at Token Launch ({(vestingTokens * 0.4).toFixed(0)} $HVNA = ${(vestingTokens * 0.4 * tokenPrice).toFixed(2)})</div>
                    <div>• 40% at 3 Months Post-Launch ({(vestingTokens * 0.4).toFixed(0)} $HVNA = ${(vestingTokens * 0.4 * tokenPrice).toFixed(2)})</div>
                    <div>• 20% at 6 Months Post-Launch ({(vestingTokens * 0.2).toFixed(0)} $HVNA = ${(vestingTokens * 0.2 * tokenPrice).toFixed(2)})</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenHoldingsDashboard;
