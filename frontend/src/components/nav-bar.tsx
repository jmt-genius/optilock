'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WalletIcon } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import Logo from '@/components/ui/logo'
import Image from 'next/image'

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
    { name: 'Metamask', href: '/metamask' },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 text-xl font-bold">
                <Image src="/logo.png" alt="dydx" width={100} height={80} />
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


