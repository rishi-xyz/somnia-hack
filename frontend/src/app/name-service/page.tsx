'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useChainId } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletConnect } from '@/components/WalletConnect'
import { CONTRACT_ADDRESSES, SOMNIA_NAME_SERVICE_ABI } from '@/lib/contracts'
import { formatAddress } from '@/lib/utils'
import { somnia } from '@/lib/wagmi'
import { ArrowLeft, Globe, Users, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

type TabType = 'register' | 'resolve' | 'my-names'

export default function NameServicePage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [activeTab, setActiveTab] = useState<TabType>('register')
  
  // Register form
  const [nameToRegister, setNameToRegister] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)
  
  // Resolve form
  const [nameToResolve, setNameToResolve] = useState('')
  const [resolveError, setResolveError] = useState<string | null>(null)
  
  // Transfer form
  const [nameToTransfer, setNameToTransfer] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)
  
  // Transaction tracking
  const processedTransactionRef = useRef<string | null>(null)

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  // Check if user is on the correct network
  const isCorrectNetwork = chainId === somnia.id
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read user's names
  const { data: userNames, refetch: refetchUserNames } = useReadContract({
    address: CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE as `0x${string}`,
    abi: SOMNIA_NAME_SERVICE_ABI,
    functionName: 'getOwnerNames',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read name info for resolve
  const { data: nameInfo, refetch: refetchNameInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE as `0x${string}`,
    abi: SOMNIA_NAME_SERVICE_ABI,
    functionName: 'getNameInfo',
    args: nameToResolve ? [nameToResolve] : undefined,
    query: {
      enabled: !!nameToResolve,
    },
  })

  const handleSwitchToSomnia = async () => {
    try {
      await switchChain({ chainId: somnia.id })
    } catch (err) {
      console.error('Error switching to Somnia testnet:', err)
    }
  }

  const getErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred'
    
    const message = error.message || error.toString()
    
    // Common error patterns and their user-friendly messages
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
      return 'Transaction failed. The name might already be taken or invalid.'
    }
    if (message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (message.includes('timeout')) {
      return 'Transaction timed out. Please try again.'
    }
    
    // Return a truncated version of the original message if it's too long
    return message.length > 100 ? message.substring(0, 100) + '...' : message
  }

  const clearErrors = () => {
    setRegisterError(null)
    setResolveError(null)
    setTransferError(null)
    setRegisterSuccess(null)
    setTransferSuccess(null)
  }

  // Timeout mechanism to prevent stuck processing states
  const resetProcessingStates = () => {
    setIsRegistering(false)
    setIsTransferring(false)
  }

  // Set a timeout to reset processing states if they get stuck
  React.useEffect(() => {
    if (isRegistering || isTransferring) {
      const timeout = setTimeout(() => {
        console.warn('Processing state timeout - resetting states')
        resetProcessingStates()
      }, 30000) // 30 second timeout

      return () => clearTimeout(timeout)
    }
  }, [isRegistering, isTransferring])

  const handleRegisterName = async () => {
    if (!isConnected || !nameToRegister) return

    // Reset states for new transaction
    setRegisterSuccess(null)
    processedTransactionRef.current = null
    
    // Clear previous errors
    clearErrors()

    if (!isCorrectNetwork) {
      setRegisterError('Please switch to Somnia Testnet to register names. You need STT tokens for gas fees.')
      return
    }

    if (!CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE) {
      setRegisterError('Contract address not configured. Please check your environment variables.')
      return
    }

    // Basic validation
    if (!nameToRegister.endsWith('.somnia')) {
      setRegisterError('Name must end with .somnia')
      return
    }

    if (nameToRegister.length < 3) {
      setRegisterError('Name must be at least 3 characters long')
      return
    }

    setIsRegistering(true)

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE as `0x${string}`,
        abi: SOMNIA_NAME_SERVICE_ABI,
        functionName: 'registerName',
        args: [nameToRegister],
      })
    } catch (err) {
      console.error('Error registering name:', err)
      setRegisterError(getErrorMessage(err))
      setIsRegistering(false)
    }
  }

  const handleResolveName = async () => {
    if (!nameToResolve) return
    
    // Clear previous errors
    clearErrors()
    
    // Basic validation
    if (!nameToResolve.endsWith('.somnia')) {
      setResolveError('Name must end with .somnia')
      return
    }
    
    try {
      await refetchNameInfo()
    } catch (err) {
      console.error('Error resolving name:', err)
      setResolveError(getErrorMessage(err))
    }
  }

  const handleTransferName = async () => {
    if (!isConnected || !nameToTransfer || !newOwner) return

    // Reset states for new transaction
    setTransferSuccess(null)
    processedTransactionRef.current = null
    
    // Clear previous errors
    clearErrors()

    if (!isCorrectNetwork) {
      setTransferError('Please switch to Somnia Testnet to transfer names. You need STT tokens for gas fees.')
      return
    }

    if (!CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE) {
      setTransferError('Contract address not configured. Please check your environment variables.')
      return
    }

    // Basic validation
    if (!nameToTransfer.endsWith('.somnia')) {
      setTransferError('Name must end with .somnia')
      return
    }

    if (!newOwner.startsWith('0x') || newOwner.length !== 42) {
      setTransferError('Please enter a valid Ethereum address')
      return
    }

    setIsTransferring(true)

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE as `0x${string}`,
        abi: SOMNIA_NAME_SERVICE_ABI,
        functionName: 'transferName',
        args: [nameToTransfer, newOwner as `0x${string}`],
      })
    } catch (err) {
      console.error('Error transferring name:', err)
      setTransferError(getErrorMessage(err))
      setIsTransferring(false)
    }
  }

  // Handle successful transactions
  useEffect(() => {
    if (isConfirmed && hash && processedTransactionRef.current !== hash) {
      processedTransactionRef.current = hash
      
      if (activeTab === 'register') {
        setNameToRegister('')
        refetchUserNames()
        setIsRegistering(false)
        setRegisterSuccess('Name registered successfully!')
        // Clear success message after 5 seconds
        setTimeout(() => setRegisterSuccess(null), 5000)
      } else if (activeTab === 'my-names') {
        setNameToTransfer('')
        setNewOwner('')
        refetchUserNames()
        setIsTransferring(false)
        setTransferSuccess('Name transferred successfully!')
        // Clear success message after 5 seconds
        setTimeout(() => setTransferSuccess(null), 5000)
      }
      // Clear any errors on successful transaction
      clearErrors()
    }
  }, [isConfirmed, hash, activeTab, refetchUserNames])

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

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      if (activeTab === 'register') {
        setRegisterError(getErrorMessage(error))
        setIsRegistering(false)
      } else if (activeTab === 'my-names') {
        setTransferError(getErrorMessage(error))
        setIsTransferring(false)
      }
    }
  }, [error, activeTab])

  const getResolveResult = () => {
    if (!nameToResolve || !nameInfo) return null

    const [owner, registeredAt, exists] = nameInfo

    if (!exists) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 font-medium">Name not found</span>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-600 font-medium">Name resolved successfully</span>
        </div>
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-md border border-white/20">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Address:</span>
              <p className="font-mono text-black">{formatAddress(owner)}</p>
            </div>
            <div>
              <span className="text-gray-600">Registered:</span>
              <p className="text-black">{new Date(Number(registeredAt) * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'register' as TabType, label: 'Register Name', icon: Globe },
    { id: 'resolve' as TabType, label: 'Resolve Name', icon: Search },
    { id: 'my-names' as TabType, label: 'My Names', icon: Users },
  ]

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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-white">Somnia Name Service</h1>
            </div>
            <p className="text-gray-600">
              Register and manage human-readable names for addresses
            </p>
          </div>

          {!isConnected ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  You need to connect your wallet to use the name service
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
                  You need to be on Somnia Testnet to use the name service. You'll need STT tokens for gas fees.
                </p>
                <Button onClick={handleSwitchToSomnia} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Switch to Somnia Testnet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Register Tab */}
              {activeTab === 'register' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Register New Name</CardTitle>
                    <CardDescription>
                      Register a human-readable name ending with .somnia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nameToRegister" className="text-sm font-medium">
                        Name (e.g., rishi.somnia)
                      </label>
                      <Input
                        id="nameToRegister"
                        type="text"
                        placeholder="rishi.somnia"
                        value={nameToRegister}
                        onChange={(e) => {
                          setNameToRegister(e.target.value)
                          if (registerError) setRegisterError(null)
                          if (registerSuccess) setRegisterSuccess(null)
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Names must end with .somnia and contain only alphanumeric characters and hyphens
                      </p>
                    </div>

                    {registerError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          {registerError}
                        </p>
                      </div>
                    )}

                    {registerSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-600">
                          {registerSuccess}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleRegisterName}
                      disabled={!nameToRegister || isPending || isConfirming || isRegistering}
                      className="w-full"
                    >
                      {isPending || isConfirming || isRegistering ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {isPending ? 'Confirm in wallet...' : isConfirming ? 'Registering name...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Register Name
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

              {/* Resolve Tab */}
              {activeTab === 'resolve' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resolve Name</CardTitle>
                    <CardDescription>
                      Look up the address for a registered name
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nameToResolve" className="text-sm font-medium">
                        Name to resolve
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="nameToResolve"
                          type="text"
                          placeholder="rishi.somnia"
                          value={nameToResolve}
                          onChange={(e) => {
                            setNameToResolve(e.target.value)
                            if (resolveError) setResolveError(null)
                          }}
                        />
                        <Button
                          onClick={handleResolveName}
                          disabled={!nameToResolve}
                          variant="outline"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>

                    {resolveError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          {resolveError}
                        </p>
                      </div>
                    )}

                    {nameToResolve && getResolveResult()}
                  </CardContent>
                </Card>
              )}

              {/* My Names Tab */}
              {activeTab === 'my-names' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Registered Names</CardTitle>
                      <CardDescription>
                        Names registered to your address
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userNames && userNames.length > 0 ? (
                        <div className="space-y-2">
                          {userNames.map((name, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-md border border-white/20">
                              <span className="font-mono text-black">{name}</span>
                              <span className="text-sm text-gray-600">Active</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No names registered yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Transfer Name</CardTitle>
                      <CardDescription>
                        Transfer ownership of a name to another address
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="nameToTransfer" className="text-sm font-medium">
                          Name to transfer
                        </label>
                        <Input
                          id="nameToTransfer"
                          type="text"
                          placeholder="rishi.somnia"
                          value={nameToTransfer}
                          onChange={(e) => {
                            setNameToTransfer(e.target.value)
                            if (transferError) setTransferError(null)
                            if (transferSuccess) setTransferSuccess(null)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="newOwner" className="text-sm font-medium">
                          New owner address
                        </label>
                        <Input
                          id="newOwner"
                          type="text"
                          placeholder="0x..."
                          value={newOwner}
                          onChange={(e) => {
                            setNewOwner(e.target.value)
                            if (transferError) setTransferError(null)
                            if (transferSuccess) setTransferSuccess(null)
                          }}
                        />
                      </div>

                      {transferError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">
                            {transferError}
                          </p>
                        </div>
                      )}

                      {transferSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-600">
                            {transferSuccess}
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={handleTransferName}
                        disabled={!nameToTransfer || !newOwner || isPending || isConfirming || isTransferring}
                        className="w-full"
                      >
                        {isPending || isConfirming || isTransferring ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {isPending ? 'Confirm in wallet...' : isConfirming ? 'Transferring name...' : 'Processing...'}
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Transfer Name
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
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
