'use client'

import { useState } from 'react'
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
  
  // Resolve form
  const [nameToResolve, setNameToResolve] = useState('')
  
  // Transfer form
  const [nameToTransfer, setNameToTransfer] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

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

  const handleRegisterName = async () => {
    if (!isConnected || !nameToRegister) return

    if (!isCorrectNetwork) {
      alert('Please switch to Somnia Testnet to register names. You need STT tokens for gas fees.')
      return
    }

    if (!CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE) {
      alert('Contract address not configured. Please check your environment variables.')
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
      setIsRegistering(false)
    }
  }

  const handleResolveName = async () => {
    if (!nameToResolve) return
    refetchNameInfo()
  }

  const handleTransferName = async () => {
    if (!isConnected || !nameToTransfer || !newOwner) return

    if (!isCorrectNetwork) {
      alert('Please switch to Somnia Testnet to transfer names. You need STT tokens for gas fees.')
      return
    }

    if (!CONTRACT_ADDRESSES.SOMNIA_NAME_SERVICE) {
      alert('Contract address not configured. Please check your environment variables.')
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
      setIsTransferring(false)
    }
  }

  // Handle successful transactions
  if (isConfirmed) {
    if (activeTab === 'register') {
      setNameToRegister('')
      refetchUserNames()
    } else if (activeTab === 'my-names') {
      setNameToTransfer('')
      setNewOwner('')
      refetchUserNames()
    }
    setIsRegistering(false)
    setIsTransferring(false)
  }

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
        <div className="p-4 bg-gray-50 rounded-md">
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Address:</span>
              <p className="font-mono">{formatAddress(owner)}</p>
            </div>
            <div>
              <span className="text-gray-500">Registered:</span>
              <p>{new Date(Number(registeredAt) * 1000).toLocaleDateString()}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Somnia Name Service</h1>
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
                        onChange={(e) => setNameToRegister(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Names must end with .somnia and contain only alphanumeric characters and hyphens
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          Error: {error.message}
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
                          onChange={(e) => setNameToResolve(e.target.value)}
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
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <span className="font-mono">{name}</span>
                              <span className="text-sm text-gray-500">Active</span>
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
                          onChange={(e) => setNameToTransfer(e.target.value)}
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
                          onChange={(e) => setNewOwner(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">
                            Error: {error.message}
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
