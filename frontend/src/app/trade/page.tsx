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
import { createOption, getContract, getMyOrders, CONTRACT_ADDRESS } from '@/services/contractService'
import { useToast } from '@/hooks/use-toast'
import { ethers } from 'ethers'
import { gun, saveOrderToGun, getOrdersFromGun } from '@/services/gunService'

interface Option {
  trader: string;
  optionType: string;
  action: string;
  lots: number;
  strikePrice: number;
  premium: number;
  expiry: number;
  isActive: boolean;
  transactionHash?: string;
}

interface GunOrder {
  optionType: string;
  action: string;
  lots: number;
  strikePrice: number;
  premium: number;
  expiry: number;
  transactionHash: string;
  trader: string;
  status: 'pending' | 'confirmed';
  timestamp: number;
}

const TradePage = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [optionType, setOptionType] = useState<'call' | 'put'>('call')
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy')
  const [lots, setLots] = useState('')
  const [strikePrice, setStrikePrice] = useState('')
  const [premium, setPremium] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('')
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<Option[]>([])
  const [gunOrders, setGunOrders] = useState<GunOrder[]>([])

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

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            // Fetch blockchain orders
            const chainOrders = await getMyOrders();
            
            // Fetch Gun.js orders
            const gunOrders = await getOrdersFromGun(CONTRACT_ADDRESS);
            
            // Combine and deduplicate orders
            const allOrders = [...chainOrders];
            gunOrders.forEach(gunOrder => {
                if (!chainOrders.find((chainOrder: Option) => 
                    chainOrder.transactionHash === gunOrder.transactionHash
                )) {
                    allOrders.push(gunOrder);
                }
            });
            
            setOrders(allOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast({
                title: "Error",
                description: "Failed to fetch orders",
                variant: "destructive",
            });
        }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchGunOrders = async () => {
      try {
        const orders = await getOrdersFromGun(CONTRACT_ADDRESS);
        setGunOrders(orders);
      } catch (error) {
        console.error('Error fetching Gun orders:', error);
      }
    };

    fetchGunOrders();
    
    // Set up Gun.js subscription
    gun.get('orders').map().on((order: any) => {
      if (order.contractAddress === CONTRACT_ADDRESS) {
        fetchGunOrders();
      }
    });

    return () => {
      gun.get('orders').map().off();
    };
  }, []);

  const handleTrade = async () => {
    try {
      setIsLoading(true);
      const expiryDateTime = `${expiryDate}T${expiryTime}:00`;
      const expiryTimestamp = Math.floor(new Date(expiryDateTime).getTime() / 1000);

      // Save to Gun.js first
      await saveOrderToGun(CONTRACT_ADDRESS, {
        optionType,
        action: tradeAction,
        lots: Number(lots),
        strikePrice: Number(strikePrice),
        premium: Number(premium),
        expiry: expiryTimestamp,
        transactionHash: '', // Empty until blockchain transaction
        trader: 'pending', // Will be updated after blockchain transaction
        timestamp: Date.now(),
        status: 'pending'
      });

      // Then create blockchain transaction
      const transaction = await createOption(
        optionType,
        tradeAction,
        Number(lots),
        Number(strikePrice),
        Number(premium),
        expiryTimestamp
      );

      toast({
        title: "Success!",
        description: `Transaction hash: ${transaction.hash}`,
      });
    } catch (error) {
      console.error('Error creating option:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  "Processing..."
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

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Active Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Lots</th>
                <th className="text-right p-2">Strike Price</th>
                <th className="text-right p-2">Premium</th>
                <th className="text-right p-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className={`p-2 ${order.optionType === 'call' ? 'text-green-500' : 'text-red-500'}`}>
                    {order.optionType.toUpperCase()}
                  </td>
                  <td className={`p-2 ${order.action === 'buy' ? 'text-blue-500' : 'text-orange-500'}`}>
                    {order.action.toUpperCase()}
                  </td>
                  <td className="p-2">{order.lots.toString()}</td>
                  <td className="text-right p-2">
                    ${Number(ethers.formatEther(order.strikePrice)).toFixed(2)}
                  </td>
                  <td className="text-right p-2">
                    ${Number(ethers.formatEther(order.premium)).toFixed(2)}
                  </td>
                  <td className="text-right p-2">
                    {new Date(Number(order.expiry) * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Pending Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Lots</th>
                <th className="text-right p-2">Strike Price</th>
                <th className="text-right p-2">Premium</th>
                <th className="text-right p-2">Expiry</th>
                <th className="text-right p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {gunOrders.map((order, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className={`p-2 ${order.optionType === 'call' ? 'text-green-500' : 'text-red-500'}`}>
                    {order.optionType.toUpperCase()}
                  </td>
                  <td className={`p-2 ${order.action === 'buy' ? 'text-blue-500' : 'text-orange-500'}`}>
                    {order.action.toUpperCase()}
                  </td>
                  <td className="p-2">{order.lots}</td>
                  <td className="text-right p-2">${order.strikePrice}</td>
                  <td className="text-right p-2">${order.premium}</td>
                  <td className="text-right p-2">
                    {new Date(order.expiry * 1000).toLocaleString()}
                  </td>
                  <td className="text-right p-2">
                    <span className={order.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default TradePage