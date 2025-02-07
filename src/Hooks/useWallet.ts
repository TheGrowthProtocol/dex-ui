import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectWalletStart,
  connectWalletSuccess,
  connectWalletFailure,
  disconnectWallet,
} from "../store/wallet/walletSlice";
import { RootState } from "../store/store";
import { useNetwork } from "./useNetwork";
import { LOCAL_STORAGE_KEYS } from "../constants/localstoragekeys";
import { useProviderContext } from '../Contexts/providerContext';

export const useWallet = () => {
  const dispatch = useDispatch();
  const { isConnected, address, loading, error } = useSelector(
    (state: RootState) => state.wallet
  );
  const { connect: connectNetwork, disconnect: disconnectNetwork } =
    useNetwork();
  const { setProvider } = useProviderContext();

  const connectWallet = useCallback(async () => {
    dispatch(connectWalletStart());
    try {
      if (typeof window.ethereum !== "undefined") {
        //check if the user has already connected to the wallet
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        console.log('useNetwork-->>', accounts);

        if (accounts.length > 0) {
          dispatch(connectWalletSuccess(accounts[0]));
          // Save connection state
          localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "true");
          localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);
          //connectNetwork();
          return;
        }

        const newAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        dispatch(connectWalletSuccess(newAccounts[0]));

        // Save connection state
        localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "true");
        localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);

        //connectNetwork();
      }
    } catch (error) {
      dispatch(
        connectWalletFailure(
          error instanceof Error ? error.message : "Failed to connect wallet"
        )
      );
      throw error;
    }
  }, [dispatch, connectNetwork]);

  const disconnect = useCallback(() => {
    dispatch(disconnectWallet());
    localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "false");
    localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, "");
    disconnectNetwork();
    setProvider(null);
  }, [dispatch, disconnectNetwork, setProvider]);

  const displayBalance = useCallback(() => {

  }, []);

  // Add auto-connect on app load
  useEffect(() => {
    const wasConnected = localStorage.getItem(
      LOCAL_STORAGE_KEYS.WALLET_CONNECTED
    );
    if (wasConnected === "true") {
      //connectWallet();
      connectMetaMask();
    }
  }, [connectWallet]);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
          localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "false");
          localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, "");
        } else {
          // Account changed
          dispatch(connectWalletSuccess(accounts[0]));
          localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "true");
          localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      // Cleanup
      return () => {
        window.ethereum?.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [dispatch,disconnect]);


  const connectMetaMask = async (): Promise<void> => {
    try {
      if(typeof window.ethereum !== "undefined") {
        const providers = window.ethereum.providers || [window.ethereum];
        
        const targetProvider = providers.find(
          (provider): provider is MetaMaskProvider => {
            const isMetaMask = 'isMetaMask' in provider && provider.isMetaMask;
            const isTrust = 'isTrust' in provider && provider.isTrust;
            return isMetaMask && !isTrust;
          }
        );
        
        if (!targetProvider) {
          throw new Error('MetaMask not found. Please install MetaMask.');
        } else {
            //window.ethereum = targetProvider;
            // Set the provider in context
            setProvider(targetProvider);
            
            
            const accounts = await targetProvider.request({
              method: "eth_accounts",
            });
            if (accounts.length > 0) {
              dispatch(connectWalletSuccess(accounts[0]));
              // Save connection state
              localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "true");
              localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);
              connectNetwork(targetProvider);
              return;
            }
            await targetProvider.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }],
            });
            const newAccounts = await targetProvider.request({
              method: "eth_requestAccounts",
            });
            dispatch(connectWalletSuccess(newAccounts[0]));
    
            // Save connection state
            localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_CONNECTED, "true");
            localStorage.setItem(LOCAL_STORAGE_KEYS.WALLET_ADDRESS, newAccounts[0]);
    
            connectNetwork(targetProvider);
          
          //await connectWallet();
        }
      } else {
        window.open("https://metamask.io/download/", "_blank");
      }
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      throw error;
    }
  };

  return {
    isConnected,
    address,
    loading,
    error,
    connectWallet,
    disconnect,
    displayBalance,
    connectMetaMask,
  };
};
