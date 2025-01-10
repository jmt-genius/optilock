import { ethers, BrowserProvider } from 'ethers';
import OptionsTrading from '../../contracts/OptionsTrading.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const getContract = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        

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
) => {
    try {
        const contract = await getContract();
        const transaction = await contract.createOption(
            optionType === 'call',
            action,
            lots,
            ethers.parseEther(strikePrice.toString()),
            ethers.parseEther(premium.toString()),
            expiry
        );
        
        await transaction.wait();
        return transaction;
    } catch (error) {
        console.error('Error creating option:', error);
        throw error;
    }
}; 