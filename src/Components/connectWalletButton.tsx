import React, { useEffect, useState } from "react";
import { Button, Typography } from "@material-ui/core";
import { useWallet } from "../Hooks/useWallet";
import { useSnackbar } from "notistack";
import { useNetwork } from "../Hooks/useNetwork";
import { ArrowForward } from '@material-ui/icons'; 
import WalletConnectorModal from "./walletConnectorModal";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const ConnectWalletButton: React.FC<{}> = () => {
  const { disconnect } = useWallet();
  const { isConnected, address, loading, error: walletError } = useSelector((state: RootState) => state.wallet);
  const { isConnected: isNetworkConnected} = useNetwork();
  const { enqueueSnackbar } = useSnackbar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Shortens the user's wallet address to a more readable format by
   * truncating the middle of the address and replacing it with "...".
   */
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if(walletError) {
    enqueueSnackbar(walletError, { variant: "error" }); 
  }

  const getButtonText = () => {
    if (loading) return "Connecting...";
    return "Connect Wallet";
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  if(isConnected && address && isNetworkConnected) {   
    return (
      <Button
        className="disconnect-wallet-button"
        variant="text"
        onClick={disconnect}
      >
          <Typography className={"gradient-text disconnect-wallet-button__text"}>
              Wallet Address: {shortenAddress(address)}
          </Typography>
          <ArrowForward color="primary" fontSize="small"/>
      </Button>
    );
  }

  return (
    <>
      <Button
      className={"gradient-button connect-wallet-button"}
      onClick={handleOpenModal}
    >
      <div className="button-angled-clip">
        <Typography className={"gradient-text"}>
          {getButtonText()}
        </Typography>
      </div>

    </Button>
    <WalletConnectorModal open={isModalOpen} onClose={handleCloseModal} />
    </>
    
  );
};

export default ConnectWalletButton;
