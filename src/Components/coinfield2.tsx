import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
  Input,
} from "@material-ui/core";
import COINS from "../constants/coins";
import { ethers, Contract } from "ethers";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { TOKEN, COINFIELD } from "../interfaces";
import Coindialog from "./coindialog";
import { useSnackbar } from "notistack";

import ERC20 from "../build/ERC20.json";
import WCERES from "../build/WCERES.json";
import CoinNoIcon from "./coinNoIcon";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";

const Coinfield2: React.FC<COINFIELD> = ({
  setSelectedToken,
  setAmount,
  value,
}) => {
  const [openToken2Dialog, setOpenToken2Dialog] = useState(false);
  const [selectedToken2, setSelectedToken2] = useState<TOKEN>({
    name: "",
    symbol: "",
  });
  const [balance, setBalance] = useState("0.00"); // State to store the balance
  const { enqueueSnackbar } = useSnackbar();
  const { tokens } = useSelector((state: RootState) => state.tokens);
  const {isConnected: isWalletConnected} = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    if (selectedToken2.address && isWalletConnected) {
      fetchBalance();
    }
  }, [selectedToken2, isWalletConnected]);

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
        (token) => token.name === selectedToken2.name
      )?.address;
      const tokenSymbol = tokens.find(
        (token) => token.name === selectedToken2.name
      )?.symbol;
      if (!tokenAddress) {
        console.error("Selected token address not found!");
        return;
      }

      if (tokenSymbol === "WCERS") {
        const balance = await provider.getBalance(address);
        const formattedBalance = Number(ethers.utils.formatEther(balance)).toFixed(2); // Assuming 18 decimals for CERES
        setBalance(formattedBalance);
      } else {
        const tokenContract = new Contract(tokenAddress, ERC20.abi, provider);
        const balance = await tokenContract.balanceOf(address);
        const formattedBalance = Number(ethers.utils.formatUnits(balance, 18)).toFixed(2); // Assuming 18 decimals for the token
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleToken2DialogOpen = () => {
    setOpenToken2Dialog(true);
  };

  const handleToken2DialogClose = () => {
    setOpenToken2Dialog(false);
  };

  const handleToken2Select = (token: TOKEN) => {
    setSelectedToken2(token);
    setSelectedToken(token);
    handleToken2DialogClose();
  };

  // Function to handle changing the input field
  const handleTokenAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const amount = event.target.value.trim();
    if (isNaN(Number(amount))) {
      enqueueSnackbar("Invalid amount entered", { variant: "error" });
      return;
    }
    // Update the state or perform any necessary actions here
    console.log(amount);
    setAmount(amount);
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
        <Typography variant="subtitle2">Buy</Typography>
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
            onClick={handleToken2DialogOpen}
            endIcon={<KeyboardArrowDownIcon color="primary" />}
            className="coin-field-button"
          >
            <CoinNoIcon />
            <Typography className={"token-symbol gradient-text"}>
              {selectedToken2.symbol || "Select Token"}
            </Typography>

          </Button>
          {isWalletConnected && (
          <Box
            sx={{ display: "flex", flexDirection: "row" }}
            className="coin-field-balance"
            alignItems="center"
          >
            <AccountBalanceWalletIcon fontSize="small" />
            <Typography variant="subtitle1" className="coin-field-balance-text">
              {balance}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Input
            type="text"
            placeholder="0.0"
            onChange={handleTokenAmountChange}
            value={value}
            className="coin-field-input"
            disabled={!selectedToken2.symbol} // Disable the input if no token is selected
          />
          <Typography variant="subtitle1" align="right" className="coin-field-input-value">$0.00</Typography>
        </Box>
      </Box>
      <Coindialog
        tokens={tokens}
        isOpen={openToken2Dialog}
        handleClose={handleToken2DialogClose}
        onTokenSelect={handleToken2Select}
      />
    </Box>
  );
};

export default Coinfield2;
