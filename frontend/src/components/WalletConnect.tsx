'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut, CheckCircle } from 'lucide-react'
import { formatAddress } from '@/lib/utils'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask')

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">{formatAddress(address!)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="flex items-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={() => metaMaskConnector && connect({ connector: metaMaskConnector })}
      disabled={isPending || !metaMaskConnector}
      className="gradient-primary hover:opacity-90 transition-all duration-300 glow-primary flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      {isPending ? 'Connecting...' : 'Connect MetaMask'}
    </Button>
  )
}
