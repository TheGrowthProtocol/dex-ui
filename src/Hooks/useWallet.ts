import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  connectWalletStart, 
  connectWalletSuccess, 
  connectWalletFailure,
  disconnectWallet,
} from '../store/wallet/walletSlice';
import { RootState } from '../store/store';
import { useNetwork } from './useNetwork';

export const useWallet = () => {
  const dispatch = useDispatch();
  const { isConnected, address, loading, error } = useSelector(
    (state: RootState) => state.wallet
  );
  const { connect: connectNetwork, disconnect: disconnectNetwork } = useNetwork();

  const connectWallet = useCallback(async () => {
    dispatch(connectWalletStart());
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        dispatch(connectWalletSuccess(accounts[0]));
        connectNetwork();
      } else {
        throw new Error('Please install MetaMask'); 
      }
    } catch (error) {
      dispatch(connectWalletFailure(error instanceof Error ? error.message : 'Failed to connect wallet'));
    }
  }, [dispatch, connectNetwork]);

  const disconnect = useCallback(() => {
    dispatch(disconnectWallet());
    disconnectNetwork();
  }, [dispatch, disconnectNetwork]);

  const displayBalance = useCallback(() => {
    console.log("displayBalance");
  }, [dispatch, connectNetwork]);

  return {
    isConnected,
    address,
    loading,
    error,
    connectWallet,
    disconnect,
    displayBalance
  };
};