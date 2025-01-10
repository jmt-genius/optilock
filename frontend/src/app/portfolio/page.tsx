'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ethers } from 'ethers'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface TokenBalance {
  symbol: string
  balance: string
  usdValue: number
  change24h: number
  icon?: string
}

const PortfolioPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<string | null>(null)
  const [holdings, setHoldings] = useState<TokenBalance[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const connectAndFetchBalances = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          })
          setAccount(accounts[0])
          await fetchBalances(accounts[0])
        }
      } catch (error) {
        console.error('Error connecting wallet:', error)
        toast({
          title: 'Error',
          description: 'Failed to connect wallet. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    connectAndFetchBalances()
  }, [])

  const fetchBalances = async (address: string) => {
    // Sample data - replace with actual API calls
    const mockHoldings: TokenBalance[] = [
      {
        symbol: 'ETH',
        balance: '2.5',
        usdValue: 5000,
        change24h: 2.5,
        icon: '/icons/eth.svg'
      },
      {
        symbol: 'USDC',
        balance: '1000',
        usdValue: 1000,
        change24h: 0.1,
        icon: '/icons/usdc.svg'
      },
      {
        symbol: 'WBTC',
        balance: '0.15',
        usdValue: 6000,
        change24h: -1.2,
        icon: '/icons/wbtc.svg'
      }
    ]

    setHoldings(mockHoldings)
    setTotalValue(mockHoldings.reduce((acc, token) => acc + token.usdValue, 0))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Portfolio Value
          </h3>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Positions
          </h3>
          <p className="text-2xl font-bold">{holdings.length}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Wallet Address
          </h3>
          <p className="text-sm font-medium truncate">
            {account || 'Not Connected'}
          </p>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Your Holdings</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Value (USD)</TableHead>
              <TableHead>24h Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((token) => (
              <TableRow key={token.symbol}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {token.icon && (
                      <img
                        src={token.icon}
                        alt={token.symbol}
                        className="w-6 h-6"
                      />
                    )}
                    {token.symbol}
                  </div>
                </TableCell>
                <TableCell>{token.balance}</TableCell>
                <TableCell>${token.usdValue.toLocaleString()}</TableCell>
                <TableCell className={token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {token.change24h > 0 ? '+' : ''}{token.change24h}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default PortfolioPage