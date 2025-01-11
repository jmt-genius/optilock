import Gun from 'gun/gun';

// Initialize Gun
const gun = Gun({
  peers: ['http://localhost:3000/gun'], // Replace with your Gun peer URL
  localStorage: false  // Disable localStorage to avoid AWS dependency
});

export { gun }; // Export gun instance for subscriptions

// Create a reference to orders
const orders = gun.get('orders');

export interface GunOrder {
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
  accountAddress: string;
}

export const saveOrderToGun = async (
  contractAddress: string,
  orderDetails: {
    optionType: string;
    action: string;
    lots: number;
    strikePrice: number;
    premium: number;
    expiry: number;
    transactionHash: string;
    trader: string;
    timestamp: number;
    status: 'pending' | 'confirmed';
    accountAddress: string;
  }
) => {
  try {
    const orderId = `${contractAddress}_${orderDetails.timestamp}`;
    orders.get(orderId).put({
      ...orderDetails,
      contractAddress
    });
    return orderId;
  } catch (error) {
    console.error('Error saving order to Gun:', error);
    throw error;
  }
};

export const getOrdersFromGun = (contractAddress: string): Promise<GunOrder[]> => {
  return new Promise((resolve) => {
    const ordersList: GunOrder[] = [];
    orders.map().once((order: any) => {
      if (order.contractAddress === contractAddress) {
        ordersList.push(order);
      }
    });
    resolve(ordersList.sort((a, b) => b.timestamp - a.timestamp));
  });
}; 