import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

// Somnia testnet configuration
const somnia = {
  id: 1946,
  name: 'Somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'SOM',
  },
  rpcUrls: {
    default: { http: ['https://rpc.somnia.network'] },
    public: { http: ['https://rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://explorer.somnia.network' },
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
