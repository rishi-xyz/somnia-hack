'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useChainId, useSendTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES, SOMNIA_NAME_SERVICE_ABI } from '@/lib/contracts'
import { somnia } from '@/lib/wagmi'
import { Gift, Users, QrCode, Globe, Send, CheckCircle, XCircle, AlertTriangle, RefreshCw, Copy } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  // Token transfer state
  const [recipientName, setRecipientName] = useState('')
  const [amount, setAmount] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const { sendTransaction, data: hash, isPending, error } = useSendTransaction()
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId === somnia.id
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read name info for resolution
  const { data: nameInfo, refetch: refetchNameInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE as `0x${string}`,
    abi: SOMNIA_NAME_SERVICE_ABI,
    functionName: 'getNameInfo',
    args: recipientName ? [recipientName] : undefined,
    query: {
      enabled: false, // We'll trigger this manually
    },
  })

  const handleSwitchToSomnia = async () => {
    try {
      await switchChain({ chainId: somnia.id })
    } catch (err) {
      console.error('Error switching to Somnia testnet:', err)
    }
  }

  const handleResolveName = async () => {
    if (!recipientName) return
    
    setIsResolving(true)
    setResolveError(null)
    setResolvedAddress(null)
    
    // Basic validation
    if (!recipientName.endsWith('.somnia')) {
      setResolveError('Name must end with .somnia')
      setIsResolving(false)
      return
    }
    
    try {
      const result = await refetchNameInfo()
      if (result.data) {
        const [owner, registeredAt, exists] = result.data
        if (exists) {
          setResolvedAddress(owner)
        } else {
          setResolveError('Name not found')
        }
      }
    } catch (err) {
      console.error('Error resolving name:', err)
      setResolveError('Failed to resolve name')
    } finally {
      setIsResolving(false)
    }
  }

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error('Failed to copy address: ', err)
    }
  }

  const handleTransfer = async () => {
    if (!isConnected || !resolvedAddress || !amount) return

    if (!isCorrectNetwork) {
      setTransferError('Please switch to Somnia Testnet to send tokens. You need STT tokens for gas fees.')
      return
    }

    // Basic validation
    if (!amount || parseFloat(amount) <= 0) {
      setTransferError('Please enter a valid amount')
      return
    }

    setIsTransferring(true)
    setTransferError(null)
    setTransferSuccess(null)

    try {
      await sendTransaction({
        to: resolvedAddress as `0x${string}`,
        value: parseEther(amount),
      })
    } catch (err) {
      console.error('Error sending tokens:', err)
      setTransferError('Failed to send tokens')
      setIsTransferring(false)
    }
  }

  // Handle successful transactions
  useEffect(() => {
    if (isConfirmed && hash) {
      setAmount('')
      setRecipientName('')
      setResolvedAddress(null)
      setIsTransferring(false)
      setTransferSuccess('Tokens sent successfully!')
      // Clear success message after 5 seconds
      setTimeout(() => setTransferSuccess(null), 5000)
    }
  }, [isConfirmed, hash])

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      setTransferError('Transaction failed. Please try again.')
      setIsTransferring(false)
    }
  }, [error])

  const getErrorMessage = (error: unknown): string => {
    if (!error) return 'An unknown error occurred'
    
    const message = (error as Error)?.message || String(error)
    
    if (message.includes('User rejected')) {
      return 'Transaction was cancelled by user'
    }
    if (message.includes('insufficient funds')) {
      return 'Insufficient STT tokens for gas fees. Please add more STT tokens to your wallet.'
    }
    if (message.includes('gas required exceeds allowance')) {
      return 'Transaction failed due to gas limit. Please try again.'
    }
    if (message.includes('execution reverted')) {
      return 'Transaction failed. Please check the details and try again.'
    }
    if (message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (message.includes('timeout')) {
      return 'Transaction timed out. Please try again.'
    }
    
    return message.length > 100 ? message.substring(0, 100) + '...' : message
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 glow-primary">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Somnia ENS
            </h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">Somnia Blockchain</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Voucher & Name Service
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamlessly create QR-based vouchers and manage human-readable names on the Somnia blockchain — built for speed, simplicity, and security.
          </p>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-2 gap-8 mb-24">
          {/* Name Service */}
          <Card className="group gradient-card border-border/40 hover:border-primary/50 transition-all duration-300 hover:glow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Somnia Name Service</CardTitle>
                  <CardDescription>Human-readable blockchain names</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 z-10 relative">
              <p className="text-muted-foreground leading-relaxed">
                Register memorable names like <code>you.somnia</code> linked to wallet addresses. Streamline transactions and identity on-chain.
              </p>
              <Button asChild className="w-full gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                <Link href="/name-service" className="flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 mr-2" />
                  Launch Name Service
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Voucher Redemption */}
          <Card className="group gradient-card border-border/40 hover:border-primary/50 transition-all duration-300 hover:glow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-300">
                  <Gift className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Voucher Redemption</CardTitle>
                  <CardDescription>Create & redeem QR vouchers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 z-10 relative">
              <p className="text-muted-foreground leading-relaxed">
                Lock tokens behind a unique voucher ID and redeem via QR code or ID. Perfect for gifts, promos, or secure fund transfers.
              </p>
              <div className="flex gap-3">
                <Button asChild className="w-full gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                  <Link href="/create-voucher" className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 mr-2" />
                    Create Voucher
                  </Link>
                </Button>
                <Button asChild className="w-full gradient-primary hover:opacity-90 transition-all duration-300 glow-primary">
                  <Link href="/redeem-voucher" className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 mr-2" />
                    Redeem Voucher
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Token Transfer Section */}
        {isConnected && (
          <section className="max-w-4xl mx-auto mb-24">
            <Card className="gradient-card border-border/50 glow-card">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10">
                    <Send className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Send Tokens by Name</CardTitle>
                    <CardDescription className="text-lg">
                      Transfer STT tokens using human-readable names
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isCorrectNetwork ? (
                  <div className="text-center p-8">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Switch to Somnia Testnet</h3>
                    <p className="text-muted-foreground mb-6">
                      You need to be on Somnia Testnet to send tokens. You&apos;ll need STT tokens for gas fees.
                    </p>
                    <Button onClick={handleSwitchToSomnia} size="lg">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Switch to Somnia Testnet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Recipient Name Input */}
                    <div className="space-y-3">
                      <label htmlFor="recipientName" className="text-sm font-medium">
                        Recipient Name (e.g., rishi.somnia)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="recipientName"
                          type="text"
                          placeholder="rishi.somnia"
                          value={recipientName}
                          onChange={(e) => {
                            setRecipientName(e.target.value)
                            setResolveError(null)
                            setResolvedAddress(null)
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleResolveName}
                          disabled={!recipientName || isResolving}
                          variant="outline"
                        >
                          {isResolving ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Globe className="w-4 h-4 mr-2" />
                              Resolve
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter a .somnia name to resolve the recipient&apos;s address
                      </p>
                    </div>

                    {/* Resolve Error */}
                    {resolveError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">{resolveError}</span>
                      </div>
                    )}

                    {/* Resolved Address Display */}
                    {resolvedAddress && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-medium">Address resolved successfully</span>
                        </div>
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-md border border-white/20">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Recipient Address:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="font-mono text-black text-xs break-all">{resolvedAddress}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyAddress(resolvedAddress)}
                                  className="flex items-center gap-1 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 flex-shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                  {copiedAddress ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Amount Input */}
                    {resolvedAddress && (
                      <div className="space-y-3">
                        <label htmlFor="amount" className="text-sm font-medium">
                          Amount (STT)
                        </label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.1"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value)
                            setTransferError(null)
                            setTransferSuccess(null)
                          }}
                          min="0"
                          step="0.001"
                          className="h-12 text-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the amount of STT tokens to send
                        </p>
                      </div>
                    )}

                    {/* Transfer Error */}
                    {transferError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600 font-medium">
                          {transferError}
                        </p>
                      </div>
                    )}

                    {/* Transfer Success */}
                    {transferSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-600 font-medium">
                          {transferSuccess}
                        </p>
                      </div>
                    )}

                    {/* Send Button */}
                    {resolvedAddress && (
                      <Button
                        onClick={handleTransfer}
                        disabled={!amount || isPending || isConfirming || isTransferring}
                        className="w-full h-12 text-lg gradient-primary hover:opacity-90 transition-all duration-300 glow-primary"
                      >
                        {isPending || isConfirming || isTransferring ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                            {isPending ? 'Confirm in wallet...' : isConfirming ? 'Sending tokens...' : 'Processing...'}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-3" />
                            Send Tokens
                          </>
                        )}
                      </Button>
                    )}

                    {/* Transaction Hash */}
                    {hash && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-600 font-medium">
                          Transaction submitted: {hash.slice(0, 10)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* How it Works */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              How It Works
            </h3>
            <p className="text-muted-foreground text-lg">
              Get started in 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { step: "1", title: "Connect Wallet", desc: "Use MetaMask to connect and authenticate securely." },
              { step: "2", title: "Create or Redeem", desc: "Generate QR-based vouchers or redeem them easily." },
              { step: "3", title: "Manage Names", desc: "Reserve and edit your Somnia-readable name." },
              { step: "4", title: "Send Tokens", desc: "Transfer STT tokens using human-readable names." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow-primary">
                  <span className="text-2xl font-bold text-primary">{step}</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">{title}</h4>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
