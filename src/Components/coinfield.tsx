import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, Input, styled } from "@material-ui/core";
import { ethers, Contract } from "ethers";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { TOKEN, COINFIELD } from "../interfaces";
import Coindialog from "./coindialog";
import { useSnackbarContext } from "../Contexts/snackbarContext";

import ERC20 from "../build/ERC20.json";
import CoinNoIcon from "./coinNoIcon";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import CoinIcon from "./coinIcon";
import { useProviderContext } from "../Contexts/providerContext";

const StyledCoinFieldBalance = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  marginTop: "16px",
});

const StyledCoinFieldSymbol = styled(Typography)({
  color: "var(--secondary-color)",
  marginLeft: "4px",
});

const StyledCoinFieldBalanceText = styled(Typography)({
  color: "var(--secondary-color)",
});

const StyledCoinFieldHeader = styled(Box)({
  marginBottom: "16px",
  display: "flex",
  flexDirection: "column",
});

const StyledInput = styled(Input)({
  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    "-webkit-appearance": "none",
    margin: 0
  },
  "& input[type=number]": {
    "-moz-appearance": "textfield" // Firefox
  }
});

const Coinfield: React.FC<COINFIELD> = ({
  title,
  setSelectedToken,
  setAmount,
  value,
  selectedToken,
}) => {
  const [openTokenDialog, setOpenTokenDialog] = useState(false);
  const [balance, setBalance] = useState("0.00"); // State to store the balance
  const { showSnackbar } = useSnackbarContext();
  const { tokens } = useSelector((state: RootState) => state.tokens);
  const { isConnected } = useSelector(
    (state: RootState) => state.wallet
  );

  const [selectedTokenObj, setSelectedTokenObj] = useState<TOKEN>({ name: "", address: "", symbol: "", decimals: 0, icon: "" });

  const { provider } = useProviderContext();

  /** Local State */
  const [isProviderConnected, setIsProviderConnected] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    if(provider) {
      setIsProviderConnected(true);
    } else {
      setIsProviderConnected(false);
    }
  }, [provider]);

  useEffect(() => {
    if(isConnected) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [isConnected]);

  useEffect(() => {
    const fetchBalance = async () => {
      if(selectedTokenObj.address && isProviderConnected && isWalletConnected && provider) {
      try{
        const web3Provider = new ethers.providers.Web3Provider(provider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        if(selectedTokenObj.symbol === "CERES") {
          const balance = await web3Provider.getBalance(address);
          const formattedBalance = Number(
            ethers.utils.formatEther(balance)
          ).toFixed(2); // Assuming 18 decimals for CERES
          setBalance(formattedBalance);
        } else {
          const tokenContract = new Contract(selectedTokenObj.address, ERC20.abi, web3Provider);
          const balance = await tokenContract.balanceOf(address);
          const formattedBalance = Number(ethers.utils.formatUnits(balance, 18)).toFixed(2);
          setBalance(formattedBalance);
        }
      } catch (error) {
          showSnackbar("Error fetching balance", "error");
        }
      }
    };
    fetchBalance();
  }, [selectedTokenObj, isProviderConnected, isWalletConnected, provider]);

  useEffect(() => {
    setSelectedTokenObj(selectedToken);
  }, [selectedToken]);

  const handleTokenDialogOpen = () => {
    setOpenTokenDialog(true);
  };

  const handleTokenDialogClose = () => {
    setOpenTokenDialog(false);
  };

  const handleTokenSelect = (token: TOKEN) => {
    if (selectedToken.symbol !== token.symbol) {
      if (title === "Sell") {
        showSnackbar(
          `Switching to ${token.symbol}`,
          'info'
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
      showSnackbar("Invalid Input. Please enter a valid number.", 'error');
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
      <StyledCoinFieldHeader>
        <Typography variant="subtitle2">{title}</Typography>
      </StyledCoinFieldHeader>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {isWalletConnected && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
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
          <StyledInput
            type="number"
            placeholder="0.0"
            onChange={handleTokenAmountChange}
            value={value}
            className="coin-field-input"
            disabled={!selectedToken.symbol} // Disable the input if no token is selected
          />
          <Typography
            variant="subtitle1"
            align="left"
            className="coin-field-input-value"
          >
            $0.00
          </Typography>
        </Box>
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
            <StyledCoinFieldBalance>
              <StyledCoinFieldBalanceText variant="subtitle1">
                {balance}
              </StyledCoinFieldBalanceText>
              <StyledCoinFieldSymbol variant="subtitle1">
                {selectedToken.symbol}
              </StyledCoinFieldSymbol>
            </StyledCoinFieldBalance>
          )}
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
