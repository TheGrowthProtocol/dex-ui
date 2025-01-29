import { ethers } from 'ethers';
import { useMemo } from 'react';

export const useProvider = () => {
  const provider = useMemo(() => {
    // For development/testing, you can use a default RPC URL
    const defaultRpcUrl = process.env.REACT_APP_RPC_URL;
    
    // If window.ethereum is available, use it
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    
    // Otherwise, fall back to JSON RPC provider
    return new ethers.providers.JsonRpcProvider(defaultRpcUrl);
  }, []);

  return provider;
};