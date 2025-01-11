import { ethers, BrowserProvider } from 'ethers';
import { saveOrderToGun, getOrdersFromGun } from './gunService';

const OptionsTrading = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "optionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "trader",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "optionType",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "action",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "lots",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "strikePrice",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "premium",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "expiry",
          type: "uint256",
        },
      ],
      name: "OptionCreated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_optionType",
          type: "string",
        },
        {
          internalType: "string",
          name: "_action",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "_lots",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_strikePrice",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_premium",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_expiry",
          type: "uint256",
        },
      ],
      name: "createOption",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "nextOptionId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "options",
      outputs: [
        {
          internalType: "address",
          name: "trader",
          type: "address",
        },
        {
          internalType: "string",
          name: "optionType",
          type: "string",
        },
        {
          internalType: "string",
          name: "action",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "lots",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "strikePrice",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "premium",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "expiry",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

export const CONTRACT_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export const getContract = async () => {
    if (!window?.ethereum) throw new Error('Please install MetaMask');
    const provider = new BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, OptionsTrading, signer);
};

export const createOption = async (
    optionType: 'call' | 'put',
    action: string,
    lots: number,
    strikePrice: number,
    premium: number,
    expiry: number
) => {
    if (!window?.ethereum) throw new Error('Please install MetaMask');
    const provider = new BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const trader = await signer.getAddress();
    
    const contract = await getContract();
    
    // Convert values to Wei
    const strikePriceWei = ethers.parseEther(strikePrice.toString());
    const premiumWei = ethers.parseEther(premium.toString());
    
    // Calculate total premium in Wei if buying
    const totalPremiumWei = action === 'buy' ? premiumWei * BigInt(lots) : BigInt(0);
    
    const transaction = await contract.createOption(
        optionType,
        action,
        lots,
        strikePriceWei,
        premiumWei,
        expiry,
        { value: totalPremiumWei }
    );
    
    await transaction.wait();
    
    await saveOrderToGun(CONTRACT_ADDRESS, {
        optionType,
        action,
        lots,
        strikePrice,
        premium,
        expiry,
        transactionHash: transaction.hash,
        trader,
        timestamp: Date.now(),
        status: 'confirmed',
        accountAddress: trader
    });
    
    return transaction;
};

export const getMyOrders = async () => {
    if (!window?.ethereum) throw new Error('Please install MetaMask');
    const provider = new BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Get all order IDs for this address
    const contract = await getContract();
    const orderIds = await contract.getOrdersByTrader(address);
    
    // Get the details for all orders
    const orders = await contract.getOrdersDetails(orderIds);
    
    return orders;
};

export { getOrdersFromGun } from './gunService';