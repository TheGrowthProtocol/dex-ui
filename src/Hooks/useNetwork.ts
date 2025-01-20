import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  connectNetworkStart, 
  connectNetworkSuccess, 
  connectNetworkFailure,
  disconnectNetwork,
} from '../store/network/networkSlice';
import { RootState } from '../store/store';

const TGP_NETWORK = {
    chainId: "0x17c99", // Convert 97433 to hex
    chainName: "TGP Testnet",
    rpcUrls: ["https://subnets.avax.network/tgp/testnet/rpc"],
    nativeCurrency: {
      name: "CERES",
      symbol: "CERES",
      decimals: 18,
    },
    blockExplorerUrls: ["https://subnets-test.avax.network/tgp"],
  };

export const useNetwork = () => {
  const dispatch = useDispatch();
  const { isConnected, chainId, loading, error } = useSelector(
    (state: RootState) => state.network
  );

  const connect = useCallback(async () => {
    dispatch(connectNetworkStart());
    try {
      if (typeof window.ethereum !== 'undefined') {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log("Current chain ID:", currentChainId);
        if (currentChainId !== TGP_NETWORK.chainId) {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: TGP_NETWORK.chainId }],
              });
            } catch (switchError: any) {
              // This error code indicates that the chain has not been added to MetaMask
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [TGP_NETWORK],
                });
              } else {
                throw switchError;
              }
            }
            finally {
              const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
              dispatch(connectNetworkSuccess(currentChainId));
              console.log("Connected to network:", currentChainId);
            }
        }
        else {
          dispatch(connectNetworkSuccess(currentChainId));
          console.log("Connected to network:", currentChainId);
        }
      } else {
        throw new Error('Please install MetaMask'); 
      }
    } catch (error) {
      dispatch(connectNetworkFailure(error instanceof Error ? error.message : 'Failed to connect network'));
    }
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch(disconnectNetwork());
  }, [dispatch]);

  return {
    isConnected,
    chainId,
    loading,
    error,
    connect,
    disconnect,
  };
};