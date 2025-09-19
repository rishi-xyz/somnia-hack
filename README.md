# Somnia ENS - Voucher & Name Service MVP

A Somnia blockchain hackathon MVP featuring voucher redemption system and Somnia Name Service (SNS) built with Next.js 14 and Solidity smart contracts.

## 🚀 Features

### 1. Voucher Redemption System
- **Create Vouchers**: Lock funds with unique voucher IDs and generate QR codes
- **Redeem Vouchers**: Scan QR codes or paste voucher IDs to redeem funds
- **Prevent Double Spending**: Smart contract ensures vouchers can only be redeemed once
- **Real-time Status**: Check voucher validity and redemption status

### 2. Somnia Name Service (SNS)
- **Register Names**: Create human-readable names like `rishi.somnia`
- **Resolve Names**: Look up addresses for registered names
- **Transfer Names**: Transfer ownership of names to other addresses
- **Name Validation**: Ensures names follow proper format and are unique

## 🛠 Tech Stack

### Smart Contracts
- **Solidity** ^0.8.20
- **Hardhat** for development and deployment
- **Ethers.js** for contract interaction

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **wagmi v2** + **viem** for wallet integration
- **qrcode.react** for QR code generation
- **Lucide React** for icons

## 📁 Project Structure

```
somnia-ens/
├── contracts/                 # Smart contracts
│   ├── contracts/
│   │   ├── VoucherRedemption.sol
│   │   └── SomniaNameService.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── verify.ts
│   ├── hardhat.config.ts
│   └── package.json
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── create-voucher/
│   │   │   ├── redeem-voucher/
│   │   │   ├── name-service/
│   │   │   └── page.tsx
│   │   ├── components/       # React components
│   │   │   ├── ui/           # UI components
│   │   │   ├── WalletConnect.tsx
│   │   │   └── QRCodeDisplay.tsx
│   │   └── lib/              # Utilities and configs
│   │       ├── contracts.ts
│   │       ├── wagmi.ts
│   │       └── utils.ts
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd somnia-ens
```

### 2. Set Up Smart Contracts

```bash
cd contracts
npm install
```

Create environment file:
```bash
cp env.example .env
```

Edit `.env` with your private key:
```env
PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://rpc.somnia.network
```

### 3. Deploy Smart Contracts

Compile contracts:
```bash
npx hardhat compile
```

Deploy to Somnia testnet:
```bash
npx hardhat run scripts/deploy.ts --network somnia
```

This will output contract addresses. Copy them to your frontend environment.

### 4. Set Up Frontend

```bash
cd ../frontend
npm install
```

Create environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with contract addresses:
```env
NEXT_PUBLIC_VOUCHER_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_SNS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Voucher System

1. **Create Voucher**:
   - Connect your wallet
   - Enter amount to lock
   - Click "Create Voucher"
   - Share the generated QR code or voucher ID

2. **Redeem Voucher**:
   - Connect your wallet
   - Enter or scan voucher ID
   - Check voucher status
   - Click "Redeem Voucher" if valid

### Name Service

1. **Register Name**:
   - Connect your wallet
   - Enter name ending with `.somnia`
   - Click "Register Name"

2. **Resolve Name**:
   - Enter a registered name
   - Click "Resolve" to get the address

3. **Manage Names**:
   - View your registered names
   - Transfer names to other addresses

## 🔧 Development

### Smart Contract Development

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.ts --network hardhat

# Deploy to Somnia testnet
npx hardhat run scripts/deploy.ts --network somnia
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Network Configuration

### Somnia Testnet
- **Chain ID**: 1946
- **RPC URL**: https://rpc.somnia.network
- **Explorer**: https://explorer.somnia.network
- **Currency**: SOM

## 📋 Smart Contract Details

### VoucherRedemption.sol

**Functions**:
- `createVoucher(bytes32 voucherId) payable` - Create a new voucher
- `redeemVoucher(bytes32 voucherId)` - Redeem a voucher
- `getVoucherAmount(bytes32 voucherId) view returns(uint256)` - Get voucher amount
- `getVoucherStatus(bytes32 voucherId) view returns(bool, bool, address, uint256)` - Get voucher status

**Events**:
- `VoucherCreated(bytes32 voucherId, uint256 amount, address creator)`
- `VoucherRedeemed(bytes32 voucherId, uint256 amount, address redeemer)`

### SomniaNameService.sol

**Functions**:
- `registerName(string calldata name)` - Register a new name
- `resolveName(string calldata name) view returns(address)` - Resolve name to address
- `transferName(string calldata name, address newOwner)` - Transfer name ownership
- `getOwnerNames(address owner) view returns(string[])` - Get names owned by address
- `getNameInfo(string calldata name) view returns(address, uint256, bool)` - Get name information

**Events**:
- `NameRegistered(string name, address owner)`
- `NameTransferred(string name, address from, address to)`

## 🚀 Deployment

### Deploy to Somnia Testnet

1. **Deploy Contracts**:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network somnia
```

2. **Verify Contracts** (optional):
```bash
npx hardhat run scripts/verify.ts --network somnia
```

3. **Update Frontend**:
   - Copy contract addresses to `.env.local`
   - Deploy frontend to Vercel or your preferred hosting

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 🔒 Security Considerations

- Private keys should never be committed to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet deployment
- Consider implementing access controls for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description

## 🎯 Future Enhancements

- [ ] QR code scanning with camera
- [ ] Batch voucher operations
- [ ] Name expiration system
- [ ] Subdomain support
- [ ] Mobile app
- [ ] Integration with other blockchains
- [ ] Advanced name validation rules
- [ ] Name marketplace

---

Built with ❤️ for the Somnia blockchain hackathon
