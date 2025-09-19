import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

// Somnia Shannon Testnet configuration
const somnia = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Testnet Token',
    symbol: 'STT',
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
    public: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Shannon Explorer', url: 'https://shannon-explorer.somnia.network' },
  },
} as const

export const config = createConfig({
  chains: [somnia, mainnet, sepolia],
  connectors: [
    metaMask(),
  ],
  transports: {
    [somnia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
