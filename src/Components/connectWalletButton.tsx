import React, { useState } from "react";
import { Button, styled, Typography } from "@material-ui/core";
import { useWallet } from "../Hooks/useWallet";
import { useNetwork } from "../Hooks/useNetwork";
import { ArrowForward } from "@material-ui/icons";
import WalletConnectorModal from "./walletConnectorModal";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useSnackbarContext } from "../Contexts/snackbarContext";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";

const StyledAccountBalanceWalletIcon = styled(AccountBalanceWalletIcon)(({ theme }) => ({
  marginRight: "4px",
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: "50%",
  padding: "2px",
}));

const StyledConnectWalletButton = styled(Button)(() => ({
  textTransform: "none",
  padding: "4px 8px",
}));

const StyledDisconnectWalletButton = styled(Button)(() => ({
  textTransform: "none",
  marginRight: "4px",
  padding: "4px 8px",
}));

const ConnectWalletButton: React.FC<{}> = () => {
  const { disconnect } = useWallet();
  const {
    isConnected,
    address,
    loading,
    error: walletError,
  } = useSelector((state: RootState) => state.wallet);
  const { isConnected: isNetworkConnected } = useNetwork();
  const { showSnackbar } = useSnackbarContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Shortens the user's wallet address to a more readable format by
   * truncating the middle of the address and replacing it with "...".
   */
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (walletError) {
    showSnackbar(walletError, "error");
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


  if (isConnected && address && isNetworkConnected) {
    return (
      <StyledDisconnectWalletButton
        variant="text"
        onClick={disconnect}
      >
        <Typography className={"gradient-text disconnect-wallet-button__text"}>
          <StyledAccountBalanceWalletIcon fontSize="medium" color="primary"/>
          {shortenAddress(address)}
        </Typography>
        <ArrowForward color="primary" fontSize="small" />
      </StyledDisconnectWalletButton>
    );
  }

  return (
    <>
      <StyledConnectWalletButton
        className={"gradient-button connect-wallet-button"}
        onClick={handleOpenModal}
      >
        <div className="button-angled-clip">
          <Typography className={"gradient-text"}>{getButtonText()}</Typography>
        </div>
      </StyledConnectWalletButton>
      <WalletConnectorModal open={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default ConnectWalletButton;
