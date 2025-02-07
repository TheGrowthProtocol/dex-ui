import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, Input, Button, styled } from "@material-ui/core";
import { TOKEN, TokenInputFieldProps } from "../interfaces";
import { ethers, Contract } from "ethers";

import ERC20 from "../build/ERC20.json";
import CoinNoIcon from "./coinNoIcon";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import CoinIcon from "./coinIcon";
import { useSnackbarContext } from "../Contexts/snackbarContext";
import { useProviderContext } from "../Contexts/providerContext";

const StyledTokenInputFieldBalanceContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
}));

const StyledTokenInputFieldBalance = styled(Typography)(({ theme }) => ({
  textAlign: "right",
  color: theme.palette.secondary.main,
}));

const StyledTokenInputFieldTokenSymbol = styled(Typography)(({ theme }) => ({
  color: theme.palette.secondary.main,
  marginLeft: "4px",
}));

const TokenInputField: React.FC<TokenInputFieldProps> = ({
  tokens,
  selectedToken,
  onAmountChange,
  isDisplayBalance,
  value,
}) => {
  const { showSnackbar } = useSnackbarContext();
  const { isConnected: isWalletConnected } = useSelector(
    (state: RootState) => state.wallet
  );
  const [balance, setBalance] = useState<string>("0.0");
  const [selectedTokenObj, setSelectedTokenObj] = useState<TOKEN>({
    name: "",
    address: "",
    symbol: "",
    decimals: 0,
    icon: "",
  });
  const { provider } = useProviderContext();

  const handleMaxButtonClick = () => {
    onAmountChange(balance);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.trim();
    if (isNaN(Number(amount))) {
      showSnackbar("Please enter a valid number.", "error");
      return;
    }
    onAmountChange(amount);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (provider && selectedTokenObj.address && isDisplayBalance) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(provider);
          const signer = web3Provider.getSigner();
          const address = await signer.getAddress();

          if (selectedTokenObj.symbol === "CERES" || selectedTokenObj.symbol === "WCERS") {
            const balance = await web3Provider.getBalance(address);
            const formattedBalance = Number(
              ethers.utils.formatEther(balance)
            ).toFixed(2); // Assuming 18 decimals for CERES
            setBalance(formattedBalance);
          } else {
            const tokenContract = new Contract(
              selectedTokenObj.address,
              ERC20.abi,
              web3Provider
            );
            const balance = await tokenContract.balanceOf(address);
            const formattedBalance = Number(
              ethers.utils.formatUnits(balance, 18)
            ).toFixed(2); // Assuming 18 decimals for the token
            setBalance(formattedBalance);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };
    fetchBalance();
  }, [selectedTokenObj, isDisplayBalance, provider]);

  useEffect(() => {
    setSelectedTokenObj(selectedToken);
  }, [selectedToken]);

  return (
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
              className="token-input-field-max-button"
            >
              Max
            </Button>
          </Box>
        )}
        <Input
          type="text"
          value={value}
          placeholder="0.0"
          onChange={handleInputChange}
          className="token-input-field"
        />
        <Typography
          variant="subtitle1"
          className="token-input-field-value"
          color="textSecondary"
        >
          $0.00
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {selectedToken.name !== "" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {selectedToken.icon && <CoinIcon icon={selectedToken.icon} />}
            {!selectedToken.icon && <CoinNoIcon />}
            <Typography className="token-symbol gradient-text">
              {selectedToken.symbol === 'WCERS' ? 'CERES' : selectedToken.symbol}
            </Typography>
          </Box>
        )}
        {isDisplayBalance && (
          <StyledTokenInputFieldBalanceContainer>
            <StyledTokenInputFieldBalance variant="subtitle1">
              {balance}
            </StyledTokenInputFieldBalance>
            <StyledTokenInputFieldTokenSymbol>
              {selectedToken.symbol === 'WCERS' ? 'CERES' : selectedToken.symbol}
            </StyledTokenInputFieldTokenSymbol>
          </StyledTokenInputFieldBalanceContainer>
        )}
      </Box>
    </Box>
  );
};

export default TokenInputField;
