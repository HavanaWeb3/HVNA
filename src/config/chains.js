/**
 * Multi-Chain Configuration for HVNA Token Presale
 *
 * This file contains all chain-specific configuration including:
 * - Network details (chain IDs, RPC URLs, explorers)
 * - Contract addresses (presale, USDT, price feeds)
 * - Supported payment tokens
 * - Gas fee estimates
 */

// Chain IDs
export const CHAIN_IDS = {
  ETHEREUM: 1,
  BSC: 56,
  BASE: 8453,
  // Testnets
  SEPOLIA: 11155111,
  BSC_TESTNET: 97,
  BASE_SEPOLIA: 84532
};

// USDT Token Addresses
export const USDT_ADDRESSES = {
  [CHAIN_IDS.ETHEREUM]: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // 6 decimals
  [CHAIN_IDS.BSC]: "0x55d398326f99059fF775485246999027B3197955", // 18 decimals (BSC-USD)
  [CHAIN_IDS.BASE]: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // 6 decimals
  // Testnets (using mock addresses or testnet USDT)
  [CHAIN_IDS.SEPOLIA]: "0x0000000000000000000000000000000000000000", // Mock for testing
  [CHAIN_IDS.BSC_TESTNET]: "0x0000000000000000000000000000000000000000", // Mock for testing
  [CHAIN_IDS.BASE_SEPOLIA]: "0x0000000000000000000000000000000000000000" // Mock for testing
};

// Presale Contract Addresses
// NOTE: Currently using Base contract for all chains (for UI testing)
// Deploy actual multi-chain contracts later and update these addresses
export const PRESALE_ADDRESSES = {
  [CHAIN_IDS.ETHEREUM]: "0x2cCE8fA9C5A369145319EB4906a47B319c639928", // Using Base contract temporarily
  [CHAIN_IDS.BSC]: "0x2cCE8fA9C5A369145319EB4906a47B319c639928", // Using Base contract temporarily
  [CHAIN_IDS.BASE]: "0x2cCE8fA9C5A369145319EB4906a47B319c639928", // Current Base presale (V3) - LIVE
  // Testnets
  [CHAIN_IDS.SEPOLIA]: "0x0000000000000000000000000000000000000000",
  [CHAIN_IDS.BSC_TESTNET]: "0x0000000000000000000000000000000000000000",
  [CHAIN_IDS.BASE_SEPOLIA]: "0x0000000000000000000000000000000000000000"
};

// Genesis NFT Address (currently on Base, may need bridge or verification)
export const GENESIS_NFT_ADDRESS = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642";

// Chainlink Price Feed Addresses
export const PRICE_FEEDS = {
  [CHAIN_IDS.ETHEREUM]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD
  [CHAIN_IDS.BSC]: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE", // BNB/USD
  [CHAIN_IDS.BASE]: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70" // ETH/USD
};

// Chain Configuration
export const CHAIN_CONFIG = {
  [CHAIN_IDS.ETHEREUM]: {
    id: CHAIN_IDS.ETHEREUM,
    name: "Ethereum",
    shortName: "ETH",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: [
      "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      "https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
      "https://cloudflare-eth.com"
    ],
    blockExplorerUrls: ["https://etherscan.io"],
    icon: "🔷",
    color: "#627EEA",
    paymentTokens: ["ETH", "USDT"],
    avgGasFee: "$20-100",
    gasFeeTier: "high",
    bestFor: "Large purchases ($1,000+)"
  },
  [CHAIN_IDS.BSC]: {
    id: CHAIN_IDS.BSC,
    name: "BNB Smart Chain",
    shortName: "BSC",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org"
    ],
    blockExplorerUrls: ["https://bscscan.com"],
    icon: "🟡",
    color: "#F3BA2F",
    paymentTokens: ["BNB", "USDT"],
    avgGasFee: "$0.30-1",
    gasFeeTier: "low",
    bestFor: "BNB holders, medium purchases"
  },
  [CHAIN_IDS.BASE]: {
    id: CHAIN_IDS.BASE,
    name: "Base",
    shortName: "BASE",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: [
      "https://mainnet.base.org",
      "https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
    ],
    blockExplorerUrls: ["https://basescan.org"],
    icon: "🔵",
    color: "#0052FF",
    paymentTokens: ["ETH", "USDT"],
    avgGasFee: "$0.50-2",
    gasFeeTier: "low",
    bestFor: "Small to medium purchases"
  }
};

// Payment Token Details
export const PAYMENT_TOKENS = {
  ETH: {
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    icon: "⟠",
    color: "#627EEA",
    isNative: true,
    chains: [CHAIN_IDS.ETHEREUM, CHAIN_IDS.BASE]
  },
  BNB: {
    symbol: "BNB",
    name: "BNB",
    decimals: 18,
    icon: "💎",
    color: "#F3BA2F",
    isNative: true,
    chains: [CHAIN_IDS.BSC]
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6, // Default, but BSC uses 18
    icon: "💵",
    color: "#26A17B",
    isNative: false,
    chains: [CHAIN_IDS.ETHEREUM, CHAIN_IDS.BSC, CHAIN_IDS.BASE],
    // Special handling for BSC USDT (18 decimals)
    getDecimals: (chainId) => {
      return chainId === CHAIN_IDS.BSC ? 18 : 6;
    }
  }
};

/**
 * Get chain configuration by chain ID
 * @param {number} chainId - The chain ID
 * @returns {object} Chain configuration
 */
export function getChainConfig(chainId) {
  return CHAIN_CONFIG[chainId] || null;
}

/**
 * Get presale contract address for a specific chain
 * @param {number} chainId - The chain ID
 * @returns {string} Contract address
 */
export function getPresaleAddress(chainId) {
  return PRESALE_ADDRESSES[chainId] || null;
}

/**
 * Get USDT token address for a specific chain
 * @param {number} chainId - The chain ID
 * @returns {string} USDT address
 */
export function getUSDTAddress(chainId) {
  return USDT_ADDRESSES[chainId] || null;
}

/**
 * Get available payment tokens for a specific chain
 * @param {number} chainId - The chain ID
 * @returns {array} Array of payment token symbols
 */
export function getPaymentTokensForChain(chainId) {
  const chainConfig = getChainConfig(chainId);
  return chainConfig ? chainConfig.paymentTokens : [];
}

/**
 * Check if a chain is supported
 * @param {number} chainId - The chain ID
 * @returns {boolean} True if supported
 */
export function isSupportedChain(chainId) {
  return !!CHAIN_CONFIG[chainId];
}

/**
 * Get native token symbol for a chain
 * @param {number} chainId - The chain ID
 * @returns {string} Native token symbol (ETH, BNB, etc.)
 */
export function getNativeTokenSymbol(chainId) {
  const chainConfig = getChainConfig(chainId);
  return chainConfig ? chainConfig.nativeCurrency.symbol : "ETH";
}

/**
 * Format chain for wallet_addEthereumChain request
 * @param {number} chainId - The chain ID
 * @returns {object} Formatted chain parameters
 */
export function formatChainForWallet(chainId) {
  const config = getChainConfig(chainId);
  if (!config) return null;

  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: config.name,
    nativeCurrency: config.nativeCurrency,
    rpcUrls: config.rpcUrls,
    blockExplorerUrls: config.blockExplorerUrls
  };
}

/**
 * Get all supported chains for dropdown/selection
 * @returns {array} Array of chain configs
 */
export function getAllSupportedChains() {
  return Object.values(CHAIN_CONFIG);
}

/**
 * Get chain name from chain ID
 * @param {number} chainId - The chain ID
 * @returns {string} Chain name
 */
export function getChainName(chainId) {
  const config = getChainConfig(chainId);
  return config ? config.name : "Unknown";
}

/**
 * Convert chain ID to hex format for wallet requests
 * @param {number} chainId - The chain ID
 * @returns {string} Hex chain ID
 */
export function toHexChainId(chainId) {
  return `0x${chainId.toString(16)}`;
}

export default {
  CHAIN_IDS,
  CHAIN_CONFIG,
  USDT_ADDRESSES,
  PRESALE_ADDRESSES,
  PAYMENT_TOKENS,
  getChainConfig,
  getPresaleAddress,
  getUSDTAddress,
  getPaymentTokensForChain,
  isSupportedChain,
  getNativeTokenSymbol,
  formatChainForWallet,
  getAllSupportedChains,
  getChainName,
  toHexChainId
};
