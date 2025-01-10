'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WalletIcon } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function NavBar() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const pathname = usePathname()

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this feature')
      return
    }

    try {
      setIsConnecting(true)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const navLinks = [
    { name: 'Trade', href: '/trade' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Markets', href: '/markets' },
    { name: 'Analytics', href: '/analytics' }
  ]

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              OptiLock
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2"
              variant={account ? "outline" : "default"}
            >
              <WalletIcon className="h-4 w-4" />
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : isConnecting
                ? 'Connecting...'
                : 'Connect Wallet'}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>
    }
  }
}
