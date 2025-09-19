#!/bin/bash

echo "🚀 Setting up Somnia ENS MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install contract dependencies
echo "📦 Installing contract dependencies..."
cd contracts
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Create environment files
echo "⚙️  Setting up environment files..."

# Create contracts .env if it doesn't exist
if [ ! -f "../contracts/.env" ]; then
    cp ../contracts/env.example ../contracts/.env
    echo "📝 Created contracts/.env - Please add your private key"
fi

# Create frontend .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    cp env.example .env.local
    echo "📝 Created frontend/.env.local - Please add contract addresses after deployment"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your private key to contracts/.env"
echo "2. Deploy contracts: cd contracts && npm run deploy:somnia"
echo "3. Copy contract addresses to frontend/.env.local"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "For detailed instructions, see README.md"
