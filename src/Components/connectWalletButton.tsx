import React from "react";
import { Button, Typography } from "@material-ui/core";
import { useWallet } from "../Hooks/useWallet";
import { useSnackbar } from "notistack";
import { useNetwork } from "../Hooks/useNetwork";

const ConnectWalletButton: React.FC<{}> = () => {
  const { isConnected, address, loading, error, connectWallet, disconnect } = useWallet();
  const { isConnected: isNetworkConnected} = useNetwork();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Shortens the user's wallet address to a more readable format by
   * truncating the middle of the address and replacing it with "...".
   */
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  if(error) {
    enqueueSnackbar(error, { variant: "error" }); 
  }

  const getButtonText = () => {
    if (loading) return "Connecting...";
    if (isConnected && address && isNetworkConnected) return `Connected: ${shortenAddress(address)}`;
    return "Connect Wallet";
  };

  return (
    <Button
      className={"gradient-button connect-wallet-button"}
      onClick={isConnected ? disconnect : connectWallet}
    >
      <div className="button-angled-clip">
        <Typography className={"gradient-text"}>
          {getButtonText()}
        </Typography>
      </div>
    </Button>
  );
};

export default ConnectWalletButton;
