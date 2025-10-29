require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.INFURA_PROJECT_ID ? `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}` : 'https://eth-sepolia.g.alchemy.com/v2/demo',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      timeout: 60000
    },
    mainnet: {
      url: process.env.INFURA_PROJECT_ID ? `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}` : 'https://cloudflare-eth.com',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 20000000000 // 20 gwei
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 8453
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: 3000000000 // 3 gwei
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 10000000000 // 10 gwei
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 30000000000 // 30 gwei
    }
  }
};
