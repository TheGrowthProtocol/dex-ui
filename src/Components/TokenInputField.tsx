import React, { useEffect, useState } from "react";
import { Box, Typography, Input } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { TokenInputFieldProps } from "../interfaces";
import { ethers, Contract } from "ethers";

import ERC20 from "../build/ERC20.json";

const TokenInputField: React.FC<TokenInputFieldProps> = ({
  tokens,
  selectedToken,
  onAmountChange,
}) => {

    const [balance, setBalance] = useState<string>("0.0");

    useEffect(() => {
        if (selectedToken.name !== "") {
            fetchBalance();
          }
    }, [selectedToken])
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
        const formattedBalance = ethers.utils.formatEther(balance); // Assuming 18 decimals for CERES
        setBalance(formattedBalance);
      } else {
        const tokenContract = new Contract(tokenAddress, ERC20.abi, provider);
        const balance = await tokenContract.balanceOf(address);
        const formattedBalance = ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals for the token
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
        <Input type="text" placeholder="0.0" onChange={onAmountChange} />
        <Typography variant="h6">0.00</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography className="liquidity-token-symbol gradient-text">
          {selectedToken.symbol}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <AccountBalanceWalletIcon />
          <Typography variant="h6">{balance}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenInputField;
