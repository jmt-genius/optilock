import { ethers, BrowserProvider } from 'ethers';
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

const CONTRACT_ADDRESS = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';

export const getContract = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Check if we're on Hardhat network
        

        const provider = new BrowserProvider(window.ethereum);
        
        const signer = await provider.getSigner();
        
        // Log contract details for debugging
        console.log('Contract ABI:', OptionsTrading);
        console.log('Contract Address:', CONTRACT_ADDRESS);
        
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            OptionsTrading,
            signer
        );
        
        // Log contract methods
        console.log('Contract methods:', contract.interface.fragments);
        
        return contract;
    } catch (error) {
        console.error('Error getting contract:', error);
        throw error;
    }
};

export const createOption = async (
    optionType: 'call' | 'put',
    action: string,
    lots: number,
    strikePrice: number,
    premium: number,
    expiry: number
): Promise<any> => {
    try {
        const contract = await getContract();
        
        const transaction = await contract.createOption(
            optionType,               // string: "call" or "put"
            action,                   // string: "buy" or "sell"
            lots,                     // uint256: number of lots
            ethers.parseEther(strikePrice.toString()),  // uint256: strike price in wei
            ethers.parseEther(premium.toString()),      // uint256: premium in wei
            expiry,                   // uint256: expiry timestamp
            { value: ethers.parseEther(premium.toString()) }  // Send premium as value
        );
        
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error('Error creating option:', error);
        throw error;
    }
};