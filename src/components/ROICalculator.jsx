import React, { useState } from 'react';

const ROICalculator = () => {
  const [investment, setInvestment] = useState(1000);

  const currentPrice = 0.01; // €0.01
  const launchPrice = 0.70;  // €0.70
  const tokensReceived = investment / currentPrice;
  const valueAtLaunch = investment * (launchPrice / currentPrice);
  const returnMultiple = launchPrice / currentPrice;

  return (
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-orange-500 text-center flex items-center justify-center gap-2">
        <span>💰</span> Calculate Your Potential Returns
      </h2>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="block font-semibold text-gray-700">
            Your Investment: <span className="text-2xl text-orange-500">€{investment.toLocaleString()}</span>
          </label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(Math.max(100, Math.min(10000, parseInt(e.target.value) || 100)))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            min="100"
            max="10000"
            step="100"
          />
        </div>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={investment}
          onChange={(e) => setInvestment(parseInt(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #fb923c 0%, #fb923c ${((investment - 100) / 9900) * 100}%, #fde68a ${((investment - 100) / 9900) * 100}%, #fde68a 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>€100</span>
          <span>€10,000</span>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-sm text-gray-600">Tokens You Receive</div>
            <div className="text-2xl font-bold text-gray-900">
              {tokensReceived.toLocaleString()} $HVNA
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Price Per Token</div>
            <div className="text-2xl font-bold text-orange-500">€0.01</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6 mb-6">
        <div className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span> Projected Value at Platform Launch
        </div>
        <div className="text-4xl font-bold mb-4">
          €{valueAtLaunch.toLocaleString()} <span className="text-2xl">💰</span>
        </div>
        <div className="text-xl mb-2">
          {returnMultiple.toFixed(0)}x return on investment
        </div>
        <div className="text-sm bg-white/20 rounded p-3 mt-4">
          <div className="flex justify-between mb-1">
            <span>Your Investment:</span>
            <span className="font-bold">€{investment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Value at Launch:</span>
            <span className="font-bold">€{valueAtLaunch.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg border-t border-white/30 pt-2 mt-2">
            <span>Profit:</span>
            <span className="font-bold text-yellow-300">
              +€{(valueAtLaunch - investment).toLocaleString()}
            </span>
          </div>
        </div>

        {investment >= 5000 && (
          <div className="bg-white/20 rounded-lg p-4 mt-4 backdrop-blur-sm">
            <div className="font-bold mb-2 text-yellow-300 flex items-center gap-2">
              <span>🎁</span> BONUS: Genesis NFT Benefits Unlocked!
            </div>
            <ul className="text-sm space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>75% Contentlynk revenue share (lifetime passive income)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>30% discount on all Havana Elephant products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>Lifetime premium features access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">✓</span>
                <span>Exclusive governance voting rights</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 text-center border-t border-gray-200 pt-4">
        <p className="mb-2">
          ⚠️ Projections based on whitepaper targets and market analysis.
        </p>
        <p className="text-xs">
          Not financial advice. Cryptocurrency investments carry risk. Past performance does not guarantee future results.
        </p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ROICalculator;
