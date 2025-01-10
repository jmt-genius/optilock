'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TradePage = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [optionType, setOptionType] = useState<'call' | 'put'>('call')
  const [amount, setAmount] = useState('')
  const [strikePrice, setStrikePrice] = useState('')
  const [expiry, setExpiry] = useState('')

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chartInstance = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#999',
      },
      grid: {
        vertLines: { color: '#2c2c2c' },
        horzLines: { color: '#2c2c2c' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })

    const candlestickSeries = chartInstance.addCandlestickSeries()
    
    // Sample data - replace with your actual data source
    const data = [
      { time: '2024-01-01', open: 1500, high: 1550, low: 1480, close: 1520 },
      { time: '2024-01-02', open: 1520, high: 1580, low: 1510, close: 1560 },
      // Add more data points...
    ]

    candlestickSeries.setData(data)
    setChart(chartInstance)

    const handleResize = () => {
      if (chartContainerRef.current) {
        chartInstance.applyOptions({
          width: chartContainerRef.current.clientWidth
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.remove()
    }
  }, [])

  const handleTrade = async () => {
    // Implement your trading logic here
    console.log({
      type: optionType,
      amount,
      strikePrice,
      expiry
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">ETH/USD</h2>
              <Select defaultValue="1D">
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1H">1H</SelectItem>
                  <SelectItem value="4H">4H</SelectItem>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="1W">1W</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div ref={chartContainerRef} />
          </Card>
        </div>

        {/* Trading Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Trade Options</h2>
          <Tabs defaultValue="call" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="call"
                onClick={() => setOptionType('call')}
              >
                Call
              </TabsTrigger>
              <TabsTrigger
                value="put"
                onClick={() => setOptionType('put')}
              >
                Put
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="strikePrice">Strike Price (USD)</Label>
                <Input
                  id="strikePrice"
                  type="number"
                  placeholder="0.0"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleTrade}
                variant={optionType === 'call' ? 'default' : 'destructive'}
              >
                {optionType === 'call' ? 'Buy Call Option' : 'Buy Put Option'}
              </Button>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default TradePage