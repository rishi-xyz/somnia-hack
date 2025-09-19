// Contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
  VOUCHER_REDEMPTION: process.env.NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS || '',
  SOMNIA_NAME_SERVICE: process.env.NEXT_PUBLIC_SNS_CONTRACT_ADDRESS || '',
}

export const VOUCHER_REDEMPTION_ABI = [
  {
    "inputs": [{"internalType": "bytes32", "name": "voucherId", "type": "bytes32"}],
    "name": "createVoucher",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "voucherId", "type": "bytes32"}],
    "name": "redeemVoucher",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "voucherId", "type": "bytes32"}],
    "name": "getVoucherAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "voucherId", "type": "bytes32"}],
    "name": "getVoucherStatus",
    "outputs": [
      {"internalType": "bool", "name": "exists", "type": "bool"},
      {"internalType": "bool", "name": "redeemed", "type": "bool"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "bytes32", "name": "voucherId", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "creator", "type": "address"}
    ],
    "name": "VoucherCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "bytes32", "name": "voucherId", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "redeemer", "type": "address"}
    ],
    "name": "VoucherRedeemed",
    "type": "event"
  }
] as const

export const SOMNIA_NAME_SERVICE_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "registerName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "resolveName",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "transferName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "getOwnerNames",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "getNameInfo",
    "outputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "NameRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "to", "type": "address"}
    ],
    "name": "NameTransferred",
    "type": "event"
  }
] as const
