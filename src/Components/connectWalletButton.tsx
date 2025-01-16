import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button, Typography } from "@material-ui/core";

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

const ConnectWalletButton = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    checkConnection();
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  /**
   * Checks if the user's wallet is already connected by attempting to get
   * the signer's address. If an address is found, updates the connection
   * state and wallet address.
   */
  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        // First check if we're already on the correct network
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (currentChainId !== TGP_NETWORK.chainId) {
          throw new Error("Wrong network. Please switch to TGP Testnet.");
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        if (address) {
          setIsConnected(true);
          setWalletAddress(address);
        }
      } else {
        throw new Error(
          "Ethereum is not supported. Please install MetaMask or another Ethereum wallet."
        );
      }
    } catch (error) {
      console.error("Error checking connection", error);
      setIsConnected(false);
    }
  };

  /**
   * Handles the accounts changed event by updating the connection state
   * and wallet address.
   */
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setWalletAddress("");
    } else {
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  /**
   * Handles the connection to the user's wallet by requesting the user's
   * address and updating the connection state and wallet address.
   */
  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        throw new Error(
          "Ethereum is not supported. Please install MetaMask or another Ethereum wallet."
        );
      }
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // First check if we're already on the correct network
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId !== TGP_NETWORK.chainId) {
        try {
          // Try to switch to the network first
          console.log("Attempting to switch network...");
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: TGP_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            console.log("Network not found, attempting to add network...");
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [TGP_NETWORK],
            });
          } else {
            throw switchError;
          }
        }
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      if (!address) {
        throw new Error("No address found. Please try again.");
      }
      setWalletAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet", error);
      setIsConnected(false);
    }
  };

  /**
   * Handles the disconnection from the user's wallet by resetting the
   * connection state and wallet address.
   */
  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  /**
   * Shortens the user's wallet address to a more readable format by
   * truncating the middle of the address and replacing it with "...".
   */
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Button
      className={"gradient-button connect-wallet-button"}
      onClick={isConnected ? handleDisconnect : handleConnect}
    >
      <div className="button-angled-clip">
        <Typography className={"gradient-text"}>
          {isConnected
            ? `Connected: ${shortenAddress(walletAddress)}`
            : "  Connect Wallet"}
        </Typography>
      </div>
    </Button>
  );
};

export default ConnectWalletButton;
