'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useChainId } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletConnect } from '@/components/WalletConnect'
import { CONTRACT_ADDRESSES, VOUCHER_REDEMPTION_ABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { somnia } from '@/lib/wagmi'
import { ArrowLeft, Gift, QrCode, CheckCircle, XCircle, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function RedeemVoucherPage() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [voucherId, setVoucherId] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemedVoucher, setRedeemedVoucher] = useState<{ id: string; amount: string } | null>(null)

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId === somnia.id
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read voucher status
  const { data: voucherStatus, refetch: refetchVoucherStatus } = useReadContract({
    address: CONTRACT_ADDRESSES.VOUCHER_REDEMPTION as `0x${string}`,
    abi: VOUCHER_REDEMPTION_ABI,
    functionName: 'getVoucherStatus',
    args: voucherId ? [voucherId as `0x${string}`] : undefined,
    query: {
      enabled: !!voucherId,
    },
  })

  const handleSwitchToSomnia = async () => {
    try {
      await switchChain({ chainId: somnia.id })
    } catch (err) {
      console.error('Error switching to Somnia testnet:', err)
    }
  }

  const handleRedeemVoucher = async () => {
    if (!isConnected || !voucherId) return

    if (!isCorrectNetwork) {
      alert('Please switch to Somnia Testnet to redeem vouchers. You need STT tokens for gas fees.')
      return
    }

    if (!CONTRACT_ADDRESSES.VOUCHER_REDEMPTION) {
      alert('Contract address not configured. Please check your environment variables.')
      return
    }

    setIsRedeeming(true)

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.VOUCHER_REDEMPTION as `0x${string}`,
        abi: VOUCHER_REDEMPTION_ABI,
        functionName: 'redeemVoucher',
        args: [voucherId as `0x${string}`],
      })
    } catch (err) {
      console.error('Error redeeming voucher:', err)
      setIsRedeeming(false)
    }
  }

  // Handle successful transaction
  if (isConfirmed && !redeemedVoucher) {
    setRedeemedVoucher({ id: voucherId, amount: voucherStatus ? formatEther(voucherStatus[3]) : '0' })
    setIsRedeeming(false)
  }

  const getVoucherStatusDisplay = () => {
    if (!voucherId || !voucherStatus) return null

    const [exists, redeemed, creator, amount] = voucherStatus

    if (!exists) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 font-medium">Voucher not found</span>
        </div>
      )
    }

    if (redeemed) {
      return (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-600 font-medium">Voucher already redeemed</span>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-600 font-medium">Voucher is valid and ready to redeem</span>
        </div>
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Amount:</span>
              <p className="font-medium">{formatEther(amount)} SOM</p>
            </div>
            <div>
              <span className="text-gray-500">Creator:</span>
              <p className="font-mono text-xs">{creator}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (redeemedVoucher) {
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
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Voucher Redeemed!</h2>
                <p className="text-gray-600 mb-6">
                  You have successfully redeemed the voucher for {redeemedVoucher.amount} SOM
                </p>
                <div className="space-y-2">
                  <Button asChild>
                    <Link href="/redeem-voucher">
                      Redeem Another Voucher
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/">
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Redeem Voucher</h1>
            </div>
            <p className="text-gray-600">
              Enter a voucher ID to check its status and redeem it
            </p>
          </div>

          {!isConnected ? (
            <Card>
              <CardContent className="p-8 text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  You need to connect your wallet to redeem vouchers
                </p>
                <WalletConnect />
              </CardContent>
            </Card>
          ) : !isCorrectNetwork ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Switch to Somnia Testnet</h3>
                <p className="text-gray-600 mb-6">
                  You need to be on Somnia Testnet to redeem vouchers. You'll need STT tokens for gas fees.
                </p>
                <Button onClick={handleSwitchToSomnia} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Switch to Somnia Testnet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voucher Information</CardTitle>
                  <CardDescription>
                    Enter the voucher ID you received
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="voucherId" className="text-sm font-medium">
                      Voucher ID
                    </label>
                    <Input
                      id="voucherId"
                      type="text"
                      placeholder="Enter voucher ID..."
                      value={voucherId}
                      onChange={(e) => setVoucherId(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      You can scan a QR code or paste the voucher ID manually
                    </p>
                  </div>

                  {voucherId && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => refetchVoucherStatus()}
                        variant="outline"
                        className="w-full"
                      >
                        Check Voucher Status
                      </Button>
                      {getVoucherStatusDisplay()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {voucherStatus && voucherStatus[0] && !voucherStatus[1] && (
                <Card>
                  <CardHeader>
                    <CardTitle>Redeem Voucher</CardTitle>
                    <CardDescription>
                      This voucher is valid and ready to be redeemed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          Error: {error.message}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleRedeemVoucher}
                      disabled={isPending || isConfirming || isRedeeming}
                      className="w-full"
                    >
                      {isPending || isConfirming || isRedeeming ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {isPending ? 'Confirm in wallet...' : isConfirming ? 'Redeeming voucher...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Redeem Voucher
                        </>
                      )}
                    </Button>

                    {hash && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-600">
                          Transaction submitted: {hash.slice(0, 10)}...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
