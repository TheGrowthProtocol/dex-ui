import React, { useEffect, useState } from "react";
import { Box, Typography, Input } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { TokenInputFieldProps } from "../interfaces";
import { ethers, Contract } from "ethers";

import ERC20 from "../build/ERC20.json";
import CoinNoIcon from "./coinNoIcon";

const TokenInputField: React.FC<TokenInputFieldProps> = ({
  tokens,
  selectedToken,
  onAmountChange,
  isDisplayBalance
}) => {

    const [balance, setBalance] = useState<string>("0.0");

    useEffect(() => {
        if (selectedToken.name !== "" && isDisplayBalance) {
            fetchBalance();
          }
    }, [selectedToken, isDisplayBalance])
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
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Input type="text" placeholder="0.0" onChange={onAmountChange}  className="token-input-field"/>
        <Typography variant="subtitle1" className="token-input-field-value">$0.00</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        { selectedToken.name !== "" && (
        <Box sx={{ display: "flex", flexDirection: "row" , alignItems: "center"}}>
          <CoinNoIcon />
          <Typography className="token-symbol gradient-text">
            {selectedToken.symbol}
          </Typography>
        </Box>
        )}
        {isDisplayBalance && (
        <Box sx={{ display: "flex", flexDirection: "row" , alignItems: "center"}} className="token-input-field-balance-container">
          <AccountBalanceWalletIcon fontSize="small" />
          <Typography variant="subtitle1" className="token-input-field-balance">{balance}</Typography>
        </Box>
        )}
      </Box>
    </Box>
  );
};

export default TokenInputField;
