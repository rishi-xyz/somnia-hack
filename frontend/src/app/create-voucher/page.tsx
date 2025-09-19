'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletConnect } from '@/components/WalletConnect'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { CONTRACT_ADDRESSES, VOUCHER_REDEMPTION_ABI } from '@/lib/contracts'
import { generateVoucherId } from '@/lib/utils'
import { somnia } from '@/lib/wagmi'
import { ArrowLeft, Gift, QrCode, AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function CreateVoucherPage() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [amount, setAmount] = useState('')
  const [voucherId, setVoucherId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdVoucher, setCreatedVoucher] = useState<{ id: string; amount: string } | null>(null)
  const processedTransactionRef = useRef<string | null>(null)

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId === somnia.id
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSwitchToSomnia = async () => {
    try {
      await switchChain({ chainId: somnia.id })
    } catch (err) {
      console.error('Error switching to Somnia testnet:', err)
    }
  }

  const handleCreateVoucher = async () => {
    if (!isConnected || !amount) return

    if (!isCorrectNetwork) {
      alert('Please switch to Somnia Testnet to create vouchers. You need STT tokens for gas fees.')
      return
    }

    if (!CONTRACT_ADDRESSES.VOUCHER_REDEMPTION) {
      alert('Contract address not configured. Please check your environment variables.')
      return
    }

    // Reset states for new transaction
    setCreatedVoucher(null)
    processedTransactionRef.current = null

    const newVoucherId = generateVoucherId()
    setVoucherId(newVoucherId)
    setIsCreating(true)

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.VOUCHER_REDEMPTION as `0x${string}`,
        abi: VOUCHER_REDEMPTION_ABI,
        functionName: 'createVoucher',
        args: [newVoucherId as `0x${string}`],
        value: parseEther(amount),
      })
    } catch (err) {
      console.error('Error creating voucher:', err)
      setIsCreating(false)
    }
  }

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash && processedTransactionRef.current !== hash) {
      processedTransactionRef.current = hash
      setCreatedVoucher({ id: voucherId, amount })
      setIsCreating(false)
    }
  }, [isConfirmed, hash, voucherId, amount])

  // Reset states when starting a new transaction
  useEffect(() => {
    if (hash && !isConfirmed && !isPending) {
      processedTransactionRef.current = null
    }
  }, [hash, isConfirmed, isPending])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      processedTransactionRef.current = null
    }
  }, [])

  if (createdVoucher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </div>
            <WalletConnect />
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <QRCodeDisplay
              voucherId={createdVoucher.id}
              amount={createdVoucher.amount}
              onCopy={() => console.log('Voucher ID copied!')}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/70 transition-colors duration-300">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100">
                <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-700">
                  {isCorrectNetwork ? 'Somnia Testnet' : `Chain ID: ${chainId}`}
                </span>
              </div>
            )}
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-green-500/10">
                <Gift className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Create Voucher
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Lock funds and create a QR code voucher that can be redeemed by anyone
            </p>
          </div>

          {!isConnected ? (
            <Card className="gradient-card border-border/50 glow-card">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <QrCode className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Connect MetaMask</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  You need to connect your MetaMask wallet to create vouchers
                </p>
                <WalletConnect />
              </CardContent>
            </Card>
          ) : !isCorrectNetwork ? (
            <Card className="gradient-card border-border/50 glow-card">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Switch to Somnia Testnet</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  You need to be on Somnia Testnet to create vouchers. You&apos;ll need STT tokens for gas fees.
                </p>
                <Button onClick={handleSwitchToSomnia} size="lg" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Switch to Somnia Testnet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="gradient-card border-border/50 glow-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Voucher Details</CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Enter the amount you want to lock in the voucher
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <label htmlFor="amount" className="text-sm font-medium text-foreground">
                    Amount (SOM)
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.001"
                    className="h-12 text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    This amount will be locked in the voucher and can be redeemed by anyone
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-sm text-destructive font-medium">
                      Error: {error.message}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCreateVoucher}
                  disabled={!amount || isPending || isConfirming || isCreating}
                  className="w-full h-12 text-lg gradient-primary hover:opacity-90 transition-all duration-300 glow-primary"
                >
                  {isPending || isConfirming || isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      {isPending ? 'Confirm in wallet...' : isConfirming ? 'Creating voucher...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-3" />
                      Create Voucher
                    </>
                  )}
                </Button>

                {hash && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-sm text-primary font-medium">
                      Transaction submitted: {hash.slice(0, 10)}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
