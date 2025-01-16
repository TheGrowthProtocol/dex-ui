import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Input } from "@material-ui/core";
import { ethers, Contract } from "ethers";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import COINS from "../constants/coins";
import { TOKEN, COINFIELD } from "../interfaces/index";
import Coindialog from "./coindialog";
import { useSnackbar } from "notistack";

import ERC20 from "../build/ERC20.json";
import WCERES from "../build/WCERES.json";
import CoinNoIcon from "./coinNoIcon";

const Coinfield1: React.FC<COINFIELD> = ({
  setSelectedToken,
  setAmount,
  value,
}) => {
  const [openToken1Dialog, setOpenToken1Dialog] = useState(false);
  const [selectedToken1, setSelectedToken1] = useState<TOKEN>({
    name: "",
    symbol: "",
  });
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokens, setTokens] = useState<TOKEN[]>([]); // Initialize as an empty array
  const [balance, setBalance] = useState("0.00"); // State to store the balance
  const { enqueueSnackbar } = useSnackbar();

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

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (selectedToken1.name !== "") {
      fetchBalance();
    }
  }, [selectedToken1]);

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
        (token) => token.name === selectedToken1.name
      )?.address;
      const tokenSymbol = tokens.find(
        (token) => token.name === selectedToken1.name
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

  /**
   * Fetches token information from the blockchain using the specified network
   * and updates the state with the fetched tokens.
   */
  const fetchTokens = async () => {
    console.log(TGP_NETWORK.rpcUrls[0]);
    try {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        TGP_NETWORK.rpcUrls[0]
      );
      const network = provider.getNetwork();
      const chainId = (await network).chainId;
      const fetchedTokens = await Promise.all(
        COINS.get(chainId).map(async (coinObject: any) => {
          const address = coinObject.address;
          const tokenContract = new Contract(
            address,
            coinObject.name == "WCERES" ? WCERES.abi : ERC20.abi,
            provider
          );
          const name = await tokenContract.name();
          const symbol = await tokenContract.symbol();
          return { name, symbol, address };
        })
      );
      console.log(fetchedTokens);
      setTokens(fetchedTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  // Function to open the dialog
  const handleToken1DialogOpen = () => {
    setOpenToken1Dialog(true);
  };

  // Function to close the dialog
  const handleToken1DialogClose = () => {
    setOpenToken1Dialog(false);
  };

  // Function to handle selecting a token and its address
  const handleToken1Select = (token: TOKEN) => {
    setSelectedToken1(token);
    setSelectedToken(token);
    handleToken1DialogClose();
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
        <Typography variant="subtitle2">Sell</Typography>
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
            onClick={handleToken1DialogOpen}
            endIcon={<KeyboardArrowDownIcon color="primary" />}
            className="coin-field-button"
          >
            <CoinNoIcon />
            <Typography className={"token-symbol gradient-text"}>
              {selectedToken1.symbol || "Select Token"}
            </Typography>
          </Button>
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
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Input
            type="text"
            placeholder="0.0"
            onChange={handleTokenAmountChange}
            value={value}
            className="coin-field-input"
            
          />
          <Typography variant="subtitle1" align="right" className="coin-field-input-value">$0.00</Typography>
        </Box>
      </Box>
      <Coindialog
        tokens={tokens}
        isOpen={openToken1Dialog}
        handleClose={handleToken1DialogClose}
        onTokenSelect={handleToken1Select}
      />
    </Box>
  );
};

export default Coinfield1;
