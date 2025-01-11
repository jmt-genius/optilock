'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Copy, ExternalLink, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WalletInfo {
  address: string
  balance: string
  chainId: string
  network: string
}

const networkNames: { [key: string]: string } = {
  '0x1': 'Ethereum Mainnet',
  '0x5': 'Goerli Testnet',
  '0x89': 'Polygon Mainnet',
  '0x13881': 'Mumbai Testnet'
}

const MetamaskPage = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const { toast } = useToast()

  const fetchWalletInfo = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          
          setWalletInfo({
            address: accounts[0],
            balance: (parseInt(balance, 16) / 1e18).toFixed(4),
            chainId,
            network: networkNames[chainId] || 'Unknown Network'
          })
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error fetching wallet info:', error)
      }
    }
  }

  useEffect(() => {
    fetchWalletInfo()
  }, [])

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask extension first",
        variant: "destructive"
      })
      return
    }

    try {
      setIsConnecting(true)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      await fetchWalletInfo()
      toast({
        title: "Connected",
        description: "Wallet connected successfully"
      })
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      })
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletInfo(null)
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully"
    })
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <Image
          src="/metamask-logo.png"
          alt="MetaMask Fox"
          width={150}
          height={150}
          className="mb-8"
          priority
        />
        <Button
          size="lg"
          onClick={connectWallet}
          disabled={isConnecting}
          className="px-8 py-6 text-lg"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Image
              src="/metamask-logo.png"
              alt="MetaMask Fox"
              width={50}
              height={50}
              priority
            />
            <h2 className="text-2xl font-bold">MetaMask Wallet</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={disconnectWallet}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-muted-foreground">Network</label>
            <p className="text-lg font-medium">{walletInfo?.network}</p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Address</label>
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium font-mono">
                {walletInfo?.address.slice(0, 6)}...{walletInfo?.address.slice(-4)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(`https://etherscan.io/address/${walletInfo?.address}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Balance</label>
            <p className="text-lg font-medium">{walletInfo?.balance} ETH</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default MetamaskPage