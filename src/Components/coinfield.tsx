import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Input } from "@material-ui/core";
import { ethers, Contract } from "ethers";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { TOKEN, COINFIELD } from "../interfaces";
import Coindialog from "./coindialog";
import { useSnackbar } from "notistack";

import ERC20 from "../build/ERC20.json";
import CoinNoIcon from "./coinNoIcon";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import CoinIcon from "./coinIcon";

const Coinfield: React.FC<COINFIELD> = ({
  title,
  setSelectedToken,
  setAmount,
  value,
  selectedToken,
}) => {
  const [openTokenDialog, setOpenTokenDialog] = useState(false);
  const [balance, setBalance] = useState("0.00"); // State to store the balance
  const { enqueueSnackbar } = useSnackbar();
  const { tokens } = useSelector((state: RootState) => state.tokens);
  const { isConnected: isWalletConnected } = useSelector(
    (state: RootState) => state.wallet
  );

  useEffect(() => {
    if (selectedToken.address && isWalletConnected) {
      fetchBalance();
    }
  }, [selectedToken, isWalletConnected]);

  /**
   * Fetches the balance of the connected wallet and updates the state.
   */
  const fetchBalance = async () => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Fetch the selected token's contract
      const tokenAddress = tokens.find(
        (token) => token.name === selectedToken.name
      )?.address;
      const tokenSymbol = tokens.find(
        (token) => token.name === selectedToken.name
      )?.symbol;
      if (!tokenAddress) {
        console.error("Selected token address not found!");
        return;
      }

      if (tokenSymbol === "CERES") {
        const balance = await provider.getBalance(address);
        const formattedBalance = Number(
          ethers.utils.formatEther(balance)
        ).toFixed(2); // Assuming 18 decimals for CERES
        setBalance(formattedBalance);
      } else {
        const tokenContract = new Contract(tokenAddress, ERC20.abi, provider);
        const balance = await tokenContract.balanceOf(address);
        const formattedBalance = Number(
          ethers.utils.formatUnits(balance, 18)
        ).toFixed(2); // Assuming 18 decimals for the token
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleTokenDialogOpen = () => {
    setOpenTokenDialog(true);
  };

  const handleTokenDialogClose = () => {
    setOpenTokenDialog(false);
  };

  const handleTokenSelect = (token: TOKEN) => {
    if (selectedToken.symbol !== token.symbol) {
      if (title === "Sell") {
        enqueueSnackbar(
          <Box display="flex" alignItems="center">
            {token.icon && <CoinIcon icon={token.icon} />}
            <Typography>Switching to {token.symbol}</Typography>
          </Box>,
          { variant: "info" }
        );
      }
      setSelectedToken(token);
    }
    handleTokenDialogClose();
  };

  // Function to handle changing the input field
  const handleTokenAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const amount = event.target.value.trim();
    if (isNaN(Number(amount))) {
      enqueueSnackbar("Invalid Input. Please enter a valid number.", {
        variant: "error",
      });
      return;
    }
    setAmount(amount);
  };

  const handleMaxButtonClick = () => {
    setAmount(balance);
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column" }}
      className="coin-field-container"
    >
      <Box
        sx={{ display: "flex", flexDirection: "column" }}
        className="coin-field-header"
      >
        <Typography variant="subtitle2">{title}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button
            variant="contained"
            onClick={handleTokenDialogOpen}
            endIcon={<KeyboardArrowDownIcon color="primary" />}
            className="coin-field-button"
          >
            {selectedToken.icon && <CoinIcon icon={selectedToken.icon} />}
            {!selectedToken.icon && <CoinNoIcon />}
            <Typography className={"token-symbol gradient-text"}>
              {selectedToken.symbol || "Select Token"}
            </Typography>
          </Button>
          {isWalletConnected && (
            <Box
              sx={{ display: "flex", flexDirection: "row" }}
              className="coin-field-balance"
              alignItems="center"
            >
              <AccountBalanceWalletIcon fontSize="small" />
              <Typography
                variant="subtitle1"
                className="coin-field-balance-text"
              >
                {balance}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {isWalletConnected && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button
                variant="text"
                onClick={handleMaxButtonClick}
                className="coin-field-max-button"
              >
                Max
              </Button>
            </Box>
          )}
          <Input
            type="text"
            placeholder="0.0"
            onChange={handleTokenAmountChange}
            value={value}
            className="coin-field-input"
            disabled={!selectedToken.symbol} // Disable the input if no token is selected
          />
          <Typography
            variant="subtitle1"
            align="right"
            className="coin-field-input-value"
          >
            $0.00
          </Typography>
        </Box>
      </Box>
      <Coindialog
        tokens={tokens}
        isOpen={openTokenDialog}
        handleClose={handleTokenDialogClose}
        onTokenSelect={handleTokenSelect}
      />
    </Box>
  );
};

export default Coinfield;
