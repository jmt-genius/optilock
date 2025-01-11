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
import { createOption } from '@/services/contractService'
import { useToast } from '@/hooks/use-toast'

const TradePage = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [candlestickSeries, setCandlestickSeries] = useState<any>(null)
  const [optionType, setOptionType] = useState<'call' | 'put'>('call')
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy')
  const [lots, setLots] = useState('')
  const [strikePrice, setStrikePrice] = useState('')
  const [premium, setPremium] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('')
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [lastClosePrice, setLastClosePrice] = useState(1500) // Starting price
  const [lastTimestamp, setLastTimestamp] = useState(Math.floor(Date.now() / 1000)) // Starting timestamp

  // Function to generate a random candlestick value
  const generateRandomCandlestick = (lastClose: number, lastTime: number) => {
    const open = lastClose
    const high = open + Math.random() * 20
    const low = open - Math.random() * 20
    const close = low + Math.random() * (high - low)
    const time = lastTime + 1 // Increment time by 1 second

    return { time, open, high, low, close }
  }

  // Initialize chart and candlestick series
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

    const candlestickSeriesInstance = chartInstance.addCandlestickSeries()
    setCandlestickSeries(candlestickSeriesInstance)

    // Set initial data for the candlestick series
    const initialData = [
      {
        time: lastTimestamp,
        open: lastClosePrice,
        high: lastClosePrice + 10,
        low: lastClosePrice - 10,
        close: lastClosePrice,
      },
    ]
    // candlestickSeriesInstance.setData(initialData)

    setChart(chartInstance)

    const handleResize = () => {
      if (chartContainerRef.current) {
        chartInstance.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.remove()
    }
  }, [])

  // Function to handle refresh button click
  const handleRefresh = () => {
    if (!candlestickSeries) return

    const newCandlestick = generateRandomCandlestick(lastClosePrice, lastTimestamp)
    candlestickSeries.update(newCandlestick)
    setLastClosePrice(newCandlestick.close) // Update the last close price
    setLastTimestamp(newCandlestick.time) // Update the last timestamp
  }

  // Polling effect to refresh the chart every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 1000) // 1000ms = 1 second

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [candlestickSeries, lastClosePrice, lastTimestamp]) // Dependencies to ensure the latest values are used

  const handleTrade = async () => {
    try {
      setIsLoading(true)
      const expiryDateTime = `${expiryDate}T${expiryTime}:00`
      const expiryTimestamp = Math.floor(new Date(expiryDateTime).getTime() / 1000)

      const transaction = await createOption(
        optionType,
        tradeAction,
        Number(lots),
        Number(strikePrice),
        Number(premium),
        expiryTimestamp
      )

      toast({
        title: 'Success!',
        description: `Transaction hash: ${transaction.hash}`,
      })
    } catch (error) {
      console.error('Error creating option:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonColor = () => {
    if (tradeAction === 'buy') {
      return optionType === 'call' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
    } else {
      return optionType === 'call' ? 'bg-green-800 hover:bg-green-900' : 'bg-red-800 hover:bg-red-900'
    }
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
            <Button className="mt-4 w-full" onClick={handleRefresh}>
              Refresh Chart
            </Button>
          </Card>
        </div>

        {/* Trading Form Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Options Trading</h2>
          <div className="space-y-4">
            {/* Call/Put Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                className={`w-full ${optionType === 'call' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'}`}
                onClick={() => setOptionType('call')}
              >
                CALL
              </Button>
              <Button
                className={`w-full ${optionType === 'put' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600'}`}
                onClick={() => setOptionType('put')}
              >
                PUT
              </Button>
            </div>

            {/* Buy/Sell Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button
                className={`w-full ${tradeAction === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600'}`}
                onClick={() => setTradeAction('buy')}
              >
                BUY
              </Button>
              <Button
                className={`w-full ${tradeAction === 'sell' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600'}`}
                onClick={() => setTradeAction('sell')}
              >
                SELL
              </Button>
            </div>

            <div>
              <Label htmlFor="lots">Number of Lots</Label>
              <Input
                id="lots"
                type="number"
                placeholder="Enter number of lots"
                value={lots}
                onChange={(e) => setLots(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="strikePrice">Strike Price (USD)</Label>
              <Input
                id="strikePrice"
                type="number"
                step="0.01"
                placeholder="Enter strike price"
                value={strikePrice}
                onChange={(e) => setStrikePrice(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="premium">Premium (USD)</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                placeholder="Enter premium price"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expiryTime">Expiry Time</Label>
                <Input
                  id="expiryTime"
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                className={`w-full text-lg font-bold h-12 ${getButtonColor()}`}
                onClick={handleTrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  `${tradeAction.toUpperCase()} ${optionType.toUpperCase()} OPTION`
                )}
              </Button>
            </div>

            {/* Updated Order Summary */}
            <Card className="p-4 mt-4 bg-gray-900">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Action:</span>
                  <span className={tradeAction === 'buy' ? 'text-blue-500' : 'text-orange-500'}>
                    {tradeAction.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className={optionType === 'call' ? 'text-green-500' : 'text-red-500'}>
                    {optionType.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total {tradeAction === 'buy' ? 'Cost' : 'Credit'}:</span>
                  <span>${Number(lots) * Number(premium) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration:</span>
                  <span>{expiryDate} {expiryTime}</span>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TradePage