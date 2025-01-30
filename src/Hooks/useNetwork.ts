import { useCallback, useEffect, useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectNetworkStart,
  connectNetworkSuccess,
  connectNetworkFailure,
  disconnectNetwork,
} from "../store/network/networkSlice";
import { RootState } from "../store/store";
import { env } from "../env";
import { ethers } from "ethers";
const TGP_NETWORK = {
  chainId: env.chainId, // Convert 97433 to hex
  chainName: env.networkName,
  rpcUrls: [env.rpcUrl],
  nativeCurrency: {
    name: env.currency.name,
    symbol: env.currency.symbol,
    decimals: env.currency.decimals,
  },
  blockExplorerUrls: [env.blockExplorerUrl],
};

export const useNetwork = () => {
  const dispatch = useDispatch();
  const { isConnected, chainId, loading, error } = useSelector(
    (state: RootState) => state.network
  );

  const [web3Provider, setWeb3Provider] = useState<ethers.providers.Web3Provider | null>(null);

  const connect = useCallback(async () => {
    dispatch(connectNetworkStart());
    try {
      if (typeof window.ethereum !== "undefined") {
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
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
          } finally {
            const currentChainId = await window.ethereum.request({
              method: "eth_chainId",
            });
            dispatch(connectNetworkSuccess(currentChainId));
          }
        } else {
          dispatch(connectNetworkSuccess(currentChainId));
        }
      } else {
        throw new Error("Please install MetaMask");
      }
    } catch (error) {
      dispatch(
        connectNetworkFailure(
          error instanceof Error ? error.message : "Failed to connect network"
        )
      );
    }
  }, [dispatch]);

  const disconnect = useCallback(() => {
    dispatch(disconnectNetwork());
  }, [dispatch]);

  const rpcProvider = useMemo(() => {
    // For development/testing, you can use a default RPC URL
    const defaultRpcUrl = env.rpcUrl;

    // Otherwise, fall back to JSON RPC provider
    return new ethers.providers.JsonRpcProvider(defaultRpcUrl);
  }, []);

  return {
    isConnected,
    chainId,
    loading,
    error,
    connect,
    disconnect,
    rpcProvider,
    web3Provider,
    setWeb3Provider,
  };
};
