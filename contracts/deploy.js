// Deploy script for GenesisMarketplace
// Run with: node deploy.js

import { ethers } from 'ethers';
import fs from 'fs';

// Configuration
const GENESIS_NFT_ADDRESS = "0x84bb6c7Bf82EE8c455643A7D613F9B160aeC0642"; // Your existing NFT contract
const BASE_RPC_URL = "https://mainnet.base.org";

// Contract bytecode and ABI will be generated after compilation
const MARKETPLACE_BYTECODE = "60a060405260fa600455348015610014575f5ffd5b5060405161194b38038061194b833981016040819052610033916100c8565b60015f55338061005c57604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b61006581610077565b506001600160a01b03166080526100f5565b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b5f602082840312156100d8575f5ffd5b81516001600160a01b03811681146100ee575f5ffd5b9392505050565b6080516118146101375f395f818161031d0152818161061a01528181610a7501528181610c3301528181610e8201528181610f4e0152610fe501526118145ff3fe60806040526004361061011b575f3560e01c80638da5cb5b1161009d578063db2e21bc11610062578063db2e21bc14610392578063de74e57b146103a6578063e757223014610412578063f2fde38b14610431578063f3f4370314610450575f5ffd5b80638da5cb5b146102db5780638dd4916b1461030c57806394383f141461033f578063961f09441461035e578063bc063e1a1461037d575f5ffd5b806351ed8288116100e357806351ed82881461022a5780636a1669641461023d578063715018a61461026057806382367b2d146102745780638546d00214610293575f5ffd5b80630373c0bf1461011f5780630bbee3ff14610154578063107a274a1461017557806330eb80cd146101f75780633ccfd60b14610216575b5f5ffd5b34801561012a575f5ffd5b5061013e610139366004611525565b61047b565b60405161014b9190611564565b60405180910390f35b34801561015f575f5ffd5b5061017361016e3660046115d0565b610582565b005b348015610180575f5ffd5b506101ea61018f36600461163c565b60408051606080820183525f808352602080840182905292840181905293845260028252928290208251938401835280548452600101546001600160a01b03811691840191909152600160a01b900460ff1615159082015290565b60405161014b9190611653565b348015610202575f5ffd5b5061017361021136600461163c565b61082b565b348015610221575f5ffd5b50610173610879565b61017361023836600461163c565b610977565b348015610248575f5ffd5b5061025260045481565b60405190815260200161014b565b34801561026b575f5ffd5b50610173610d2b565b34801561027f575f5ffd5b5061017361028e36600461167f565b610d3c565b34801561029e575f5ffd5b506102cb6102ad36600461163c565b5f90815260026020526040902060010154600160a01b900460ff1690565b604051901515815260200161014b565b3480156102e6575f5ffd5b506001546001600160a01b03165b6040516001600160a01b03909116815260200161014b565b348015610317575f5ffd5b506102f47f000000000000000000000000000000000000000000000000000000000000000081565b34801561034a575f5ffd5b5061017361035936600461167f565b610e43565b348015610369575f5ffd5b5061017361037836600461163c565b611143565b348015610388575f5ffd5b506102526103e881565b34801561039d575f5ffd5b5061017361129e565b3480156103b1575f5ffd5b506103ed6103c036600461163c565b60026020525f9081526040902080546001909101546001600160a01b03811690600160a01b900460ff1683565b604080519384526001600160a01b03909216602084015215159082015260600161014b565b34801561041d575f5ffd5b5061025261042c36600461163c565b611391565b34801561043c575f5ffd5b5061017361044b3660046116b3565b6113fd565b34801561045b575f5ffd5b5061025261046a3660046116b3565b60036020525f908152604090205481565b60605f8267ffffffffffffffff811115610497576104976116d5565b6040519080825280602002602001820160405280156104e057816020015b604080516060810182525f80825260208083018290529282015282525f199092019101816104b55790505b5090505f5b838110156105785760025f868684818110610502576105026116e9565b602090810292909201358352508181019290925260409081015f208151606081018352815481526001909101546001600160a01b03811693820193909352600160a01b90920460ff161515908201528251839083908110610565576105656116e9565b60209081029190910101526001016104e5565b5090505b92915050565b61058a611437565b8281146105d65760405162461bcd60e51b8152602060048201526015602482015274082e4e4c2f240d8cadccee8d040dad2e6dac2e8c6d605b1b60448201526064015b60405180910390fd5b5f5b83811015610824575f8383838181106105f3576105f36116e9565b90506020020135116106175760405162461bcd60e51b81526004016105cd906116fd565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316636352211e878785818110610659576106596116e9565b905060200201356040518263ffffffff1660e01b815260040161067e91815260200190565b602060405180830381865afa158015610699573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906106bd9190611734565b6001600160a01b0316146107055760405162461bcd60e51b815260206004820152600f60248201526e2737ba103a37b5b2b71037bbb732b960891b60448201526064016105cd565b6040518060600160405280848484818110610722576107226116e9565b905060200201358152602001336001600160a01b031681526020016001151581525060025f878785818110610759576107596116e9565b602090810292909201358352508181019290925260409081015f2083518155918301516001909201805493909101511515600160a01b026001600160a81b03199093166001600160a01b0390921691909117919091179055338585838181106107c4576107c46116e9565b905060200201357fd2ab19646d6f9fdd37206f962b4ebaab8a4a23ad87f7695e7e1736803cb8bf748585858181106107fe576107fe6116e9565b9050602002013560405161081491815260200190565b60405180910390a36001016105d8565b5050505050565b610833611437565b6103e88111156108745760405162461bcd60e51b815260206004820152600c60248201526b08ccaca40e8dede40d0d2ced60a31b60448201526064016105cd565b600455565b610881611464565b335f90815260036020526040902054806108d45760405162461bcd60e51b81526020600482015260146024820152734e6f2066756e647320746f20776974686472617760601b60448201526064016105cd565b335f818152600360205260408082208290555190919083908381818185875af1925050503d805f8114610922576040519150601f19603f3d011682016040523d82523d5f602084013e610927565b606091505b505090508061096a5760405162461bcd60e51b815260206004820152600f60248201526e151c985b9cd9995c8819985a5b1959608a1b60448201526064016105cd565b505061097560015f55565b565b61097f611464565b5f818152600260209081526040918290208251606081018452815481526001909101546001600160a01b03811692820192909252600160a01b90910460ff16151591810182905290610a065760405162461bcd60e51b815260206004820152601060248201526f4e4654206e6f7420666f722073616c6560801b60448201526064016105cd565b8051341015610a4e5760405162461bcd60e51b8152602060048201526014602482015273125b9cdd59999a58da595b9d081c185e5b595b9d60621b60448201526064016105cd565b60208101516040516331a9108f60e11b8152600481018490526001600160a01b03918216917f00000000000000000000000000000000000000000000000000000000000000001690636352211e90602401602060405180830381865afa158015610aba573d5f5f3e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610ade9190611734565b6001600160a01b031614610b345760405162461bcd60e51b815260206004820152601960248201527f53656c6c6572206e6f206c6f6e676572206f776e73204e46540000000000000060448201526064016105cd565b5f612710600454835f0151610b499190611763565b610b53919061177a565b90505f81835f0151610b659190611799565b5f85815260026020908152604080832083815560010180546001600160a81b0319169055868201516001600160a01b031683526003909152812080549293508392909190610bb49084906117ac565b9091555082905060035f610bd06001546001600160a01b031690565b6001600160a01b03166001600160a01b031681526020019081526020015f205f828254610bfd91906117ac565b90915550506020830151604051632142170760e11b81526001600160a01b039182166004820152336024820152604481018690527f0000000000000000000000000000000000000000000000000000000000000000909116906342842e0e906064015f604051808303815f87803b158015610c76575f5ffd5b505af1158015610c88573d5f5f3e3d5ffd5b50505050825f0151341115610cc7578251610ca39034611799565b335f9081526003602052604081208054909190610cc19084906117ac565b90915550505b82602001516001600160a01b0316336001600160a01b0316857f8d4fa5d76924913cce4b580da4c40e50715ae52df27a337f5fcaeb7614043833865f0151604051610d1491815260200190565b60405180910390a4505050610d2860015f55565b50565b610d33611437565b6109755f61148c565b5f8111610d5b5760405162461bcd60e51b81526004016105cd906116fd565b5f8281526002602052604090206001810154600160a01b900460ff16610db45760405162461bcd60e51b815260206004820152600e60248201526d139195081b9bdd081b1a5cdd195960921b60448201526064016105cd565b60018101546001600160a01b03163314610dfd5760405162461bcd60e51b815260206004820152600a6024820152692737ba1039b2b63632b960b11b60448201526064016105cd565b8054828255604080518281526020810185905285917f15819dd2fd9f6418b142e798d08a18d0bf06ea368f4480b7b0d3f75bd966bc48910160405180910390a250505050565b5f8111610e625760405162461bcd60e51b81526004016105cd906116fd565b6040516331a9108f60e11b81526004810183905233906001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690636352211e90602401602060405180830381865afa158015610ec7573d5f5f3e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610eeb9190611734565b6001600160a01b031614610f335760405162461bcd60e51b815260206004820152600f60248201526e2737ba103a37b5b2b71037bbb732b960891b60448201526064016105cd565b60405163e985e9c560e01b81523360048201523060248201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063e985e9c590604401602060405180830381865afa158015610f9b573d5f5f3e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610fbf91906117bf565b80611059575060405163020604bf60e21b81526004810183905230906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063081812fc90602401602060405180830381865afa15801561102a573d5f5f3e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061104e9190611734565b6001600160a01b0316145b6110a55760405162461bcd60e51b815260206004820152601860248201527f4d61726b6574706c616365206e6f7420617070726f766564000000000000000060448201526064016105cd565b6040805160608101825282815233602080830182815260018486018181525f8981526002909452928690209451855590519301805491511515600160a01b026001600160a81b03199092166001600160a01b03949094169390931717909155905183907fd2ab19646d6f9fdd37206f962b4ebaab8a4a23ad87f7695e7e1736803cb8bf74906111379085815260200190565b60405180910390a35050565b5f818152600260209081526040918290208251606081018452815481526001909101546001600160a01b03811692820192909252600160a01b90910460ff161515918101829052906111c85760405162461bcd60e51b815260206004820152600e60248201526d139195081b9bdd081b1a5cdd195960921b60448201526064016105cd565b60208101516001600160a01b03163314806111fc5750336111f16001546001600160a01b031690565b6001600160a01b0316145b61123e5760405162461bcd60e51b81526020600482015260136024820152722737ba1039b2b63632b91037b91037bbb732b960691b60448201526064016105cd565b5f82815260026020908152604080832083815560010180546001600160a81b03191690559083015190516001600160a01b039091169184917fb765e971c123cbdac007f49987b1aac638149f995ba62034fc509604cac5f01e9190a35050565b6112a6611437565b47806112eb5760405162461bcd60e51b81526020600482015260146024820152734e6f2066756e647320746f20776974686472617760601b60448201526064016105cd565b5f6112fe6001546001600160a01b031690565b6001600160a01b0316826040515f6040518083038185875af1925050503d805f8114611345576040519150601f19603f3d011682016040523d82523d5f602084013e61134a565b606091505b505090508061138d5760405162461bcd60e51b815260206004820152600f60248201526e151c985b9cd9995c8819985a5b1959608a1b60448201526064016105cd565b5050565b5f81815260026020526040812060010154600160a01b900460ff166113eb5760405162461bcd60e51b815260206004820152601060248201526f4e4654206e6f7420666f722073616c6560801b60448201526064016105cd565b505f9081526002602052604090205490565b611405611437565b6001600160a01b03811661142e57604051631e4fbdf760e01b81525f60048201526024016105cd565b610d288161148c565b6001546001600160a01b031633146109755760405163118cdaa760e01b81523360048201526024016105cd565b60025f540361148657604051633ee5aeb560e01b815260040160405180910390fd5b60025f55565b600180546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b5f5f83601f8401126114ed575f5ffd5b50813567ffffffffffffffff811115611504575f5ffd5b6020830191508360208260051b850101111561151e575f5ffd5b9250929050565b5f5f60208385031215611536575f5ffd5b823567ffffffffffffffff81111561154c575f5ffd5b611558858286016114dd565b90969095509350505050565b602080825282518282018190525f918401906040840190835b818110156115c5576115af838551805182526020808201516001600160a01b0316908301526040908101511515910152565b602093909301926060929092019160010161157d565b509095945050505050565b5f5f5f5f604085870312156115e3575f5ffd5b843567ffffffffffffffff8111156115f9575f5ffd5b611605878288016114dd565b909550935050602085013567ffffffffffffffff811115611624575f5ffd5b611630878288016114dd565b95989497509550505050565b5f6020828403121561164c575f5ffd5b5035919050565b815181526020808301516001600160a01b0316908201526040808301511515908201526060810161057c565b5f5f60408385031215611690575f5ffd5b50508035926020909101359150565b6001600160a01b0381168114610d28575f5ffd5b5f602082840312156116c3575f5ffd5b81356116ce8161169f565b9392505050565b634e487b7160e01b5f52604160045260245ffd5b634e487b7160e01b5f52603260045260245ffd5b6020808252601c908201527f5072696365206d7573742062652067726561746572207468616e203000000000604082015260600190565b5f60208284031215611744575f5ffd5b81516116ce8161169f565b634e487b7160e01b5f52601160045260245ffd5b808202811582820484141761057c5761057c61174f565b5f8261179457634e487b7160e01b5f52601260045260245ffd5b500490565b8181038181111561057c5761057c61174f565b8082018082111561057c5761057c61174f565b5f602082840312156117cf575f5ffd5b815180151581146116ce575f5ffdfea2646970667358221220a159d792391bdda7f55cd43c7892743c584458a577bc595fee9368b42af3140464736f6c634300081e0033"; // Will be filled after compilation
const MARKETPLACE_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_genesisNFT",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "NFTListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "NFTPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "NFTUnlisted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldPrice",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newPrice",
        "type": "uint256"
      }
    ],
    "name": "PriceUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "tokenIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "prices",
        "type": "uint256[]"
      }
    ],
    "name": "batchListNFTs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "genesisNFT",
    "outputs": [
      {
        "internalType": "contract IERC721",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getListing",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct GenesisMarketplace.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "tokenIds",
        "type": "uint256[]"
      }
    ],
    "name": "getListings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct GenesisMarketplace.Listing[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "isForSale",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "listings",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketplaceFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "pendingWithdrawals",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "unlistNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newFee",
        "type": "uint256"
      }
    ],
    "name": "updateMarketplaceFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "newPrice",
        "type": "uint256"
      }
    ],
    "name": "updatePrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; // Will be filled after compilation

async function deployMarketplace() {
    console.log("🚀 Starting GenesisMarketplace deployment...");
    
    // Connect to Base network
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    
    // Create wallet from private key (you'll need to set this)
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("Please set PRIVATE_KEY environment variable");
    }
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log("📝 Deploying from address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.001")) {
        throw new Error("Insufficient balance for deployment");
    }
    
    // Deploy contract
    const contractFactory = new ethers.ContractFactory(
        MARKETPLACE_ABI,
        MARKETPLACE_BYTECODE,
        wallet
    );
    
    console.log("🔨 Deploying GenesisMarketplace...");
    const marketplace = await contractFactory.deploy(GENESIS_NFT_ADDRESS);
    
    console.log("⏳ Waiting for deployment confirmation...");
    await marketplace.waitForDeployment();
    
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ GenesisMarketplace deployed to:", marketplaceAddress);
    
    // Save deployment info
    const deploymentInfo = {
        marketplaceAddress,
        genesisNFTAddress: GENESIS_NFT_ADDRESS,
        network: "Base Mainnet",
        deployedAt: new Date().toISOString(),
        deployerAddress: wallet.address,
        transactionHash: marketplace.deploymentTransaction().hash
    };
    
    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to deployment.json");
    
    return marketplaceAddress;
}

// Example usage after deployment
async function setupMarketplace(marketplaceAddress) {
    console.log("\n🏪 Setting up marketplace listings...");
    
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const marketplace = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, wallet);
    
    // Define your available NFTs and prices (in ETH)
    const nftListings = [
        { tokenId: 3, price: 2.5 },   // Available NFTs
        { tokenId: 14, price: 2.0 },
        { tokenId: 15, price: 2.0 },
        { tokenId: 16, price: 1.5 },
        { tokenId: 17, price: 1.5 },
        { tokenId: 18, price: 1.5 },
        { tokenId: 71, price: 1.0 },
        { tokenId: 72, price: 1.0 },
        { tokenId: 73, price: 1.0 },
        { tokenId: 74, price: 1.0 },
        { tokenId: 75, price: 1.0 }
    ];
    
    // Convert prices to wei
    const tokenIds = nftListings.map(item => item.tokenId);
    const prices = nftListings.map(item => ethers.parseEther(item.price.toString()));
    
    console.log("📋 Listing NFTs:", tokenIds);
    console.log("💰 Prices (ETH):", nftListings.map(item => item.price));
    
    // Batch list NFTs
    const tx = await marketplace.batchListNFTs(tokenIds, prices);
    console.log("⏳ Listing transaction:", tx.hash);
    
    await tx.wait();
    console.log("✅ All NFTs listed successfully!");
}

export { deployMarketplace, setupMarketplace };

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    deployMarketplace()
        .then(address => setupMarketplace(address))
        .then(() => console.log("\n🎉 Deployment complete!"))
        .catch(error => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}