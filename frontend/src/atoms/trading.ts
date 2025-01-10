import { atom } from 'recoil'

export const walletState = atom({
  key: 'walletState',
  default: {
    connected: false,
    address: null as string | null,
  },
})

export const tradingState = atom({
  key: 'tradingState',
  default: {
    optionType: 'call' as 'call' | 'put',
    amount: '',
    strikePrice: '',
    expiry: '',
  },
}) 