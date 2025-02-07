declare global {
  // Common provider interface that all wallet providers should implement
  interface WalletProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress: string;
    chainId: string;
  }

  // MetaMask specific provider properties
  interface MetaMaskProvider extends WalletProvider {
    isMetaMask: boolean;
  }

  // Trust Wallet specific provider properties  
  interface TrustWalletProvider extends WalletProvider {
    isTrust: boolean;
  }

  // Combined provider type
  type Provider = MetaMaskProvider | TrustWalletProvider;

  interface Window {
    ethereum?: Provider & {
      providers?: Provider[];
    };
  }
}

export type { Provider };