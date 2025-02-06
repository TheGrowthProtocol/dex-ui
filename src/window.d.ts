declare global {
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    providers?: any[];
    request: (args: {method: string, params?: any[]}) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress: string;
    chainId: string;
    isWalletConnect: boolean;
    };
  }
}

export {};