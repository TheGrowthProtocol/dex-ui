import React, { useState, useEffect } from "react";
import { Box, Typography, Input, Button } from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { TOKEN } from "../interfaces";
import COINS from "../constants/coins";
import { ethers, Contract } from "ethers";
import Coindialog from "./coindialog";
import * as chains from "../constants/chains";
import IUniswapV2Router02 from "../build/IUniswapV2Router02.json";
import TokenInputField from "./TokenInputField";

import ERC20 from "../build/ERC20.json";
import WCERES from "../build/WCERES.json";
import { addLiquidity, initializeProvider } from "../store/liquidity/liquidityThunks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../store/store';
import { setToken1, setToken2, setAmount1, setAmount2, setAmount1Min, setAmount2Min } from "../store/liquidity/liquiditySlice";

const Liquidity: React.FC<{}> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [openToken1Dialog, setOpenToken1Dialog] = useState(false);
  const [openToken2Dialog, setOpenToken2Dialog] = useState(false);
  const [tokens, setTokens] = useState<TOKEN[]>([]); // Initialize as an empty array

  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);

  const liquidityState = useSelector((state: RootState) => state.liquidity);

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
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
    } else {
      console.error("MetaMask is not installed!");
    }
  }, []);

  console.log(liquidityState);
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

  // Function to close the dialog
  const handleToken1DialogClose = () => {
    setOpenToken1Dialog(false);
  };

  // Function to handle selecting a token and its address
  const handleToken1Select = (token: TOKEN) => {
    dispatch(setToken1(token));
    setOpenToken1Dialog(false);
  };
  // Function to handle input change in the first field
  const handleTokenAmount1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.trim();
    if (!isNaN(Number(amount))) {
      dispatch(setAmount1(amount));
    }
  };

  // Function to close the dialog
  const handleToken2DialogClose = () => {
    setOpenToken2Dialog(false);
  };

  // Function to handle selecting a token and its address
  const handleToken2Select = (token: TOKEN) => {
    dispatch(setToken2(token));
    setOpenToken2Dialog(false);
  };

  // Function to handle input change in the second field
  const handleTokenAmount2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.trim();
      if (!isNaN(Number(amount))) {
        dispatch(setAmount2(amount));
      }
  };

  // Function to add liquidity pool
  const handleAddLiquidityPool =  () => {
    dispatch(addLiquidity());
  };

  return (
    <>
      <Box className="tabpanel-container" sx={{ p: 3 }}>
        <Box className="tabpanel-content">
          <Box
            display="flex"
            flexDirection="column"
            className="coin-field-container coin-field-pair-block"
          >
            <Typography variant="subtitle2">Select Token Pair</Typography>
            <Box display="flex" className="coin-field-pair-container">
              <Button
                variant="contained"
                onClick={() => setOpenToken1Dialog(true)}
                endIcon={<KeyboardArrowDownIcon color="primary" />}
                className="coin-field-button"
              >
                <Typography className={"gradient-text"}>
                  {liquidityState.token1.symbol || "Select Token"}
                </Typography>
              </Button>
              <Coindialog
                tokens={tokens}
                isOpen={openToken1Dialog}
                handleClose={handleToken1DialogClose}
                onTokenSelect={handleToken1Select}
              />
              <Typography variant="h6" className="coin-field-pair-plus">+</Typography>
              <Button
                variant="contained"
                onClick={() => setOpenToken2Dialog(true)}
                endIcon={<KeyboardArrowDownIcon color="primary" />}
                className="coin-field-button"
              >
                <Typography className={"gradient-text"}>
                  {liquidityState.token2.symbol || "Select Token"} 
                </Typography>
              </Button>
              <Coindialog
                tokens={tokens}
                isOpen={openToken2Dialog}
                handleClose={handleToken2DialogClose} 
                onTokenSelect={handleToken2Select}
              />
            </Box>
          </Box>    
          <Box
            display={"flex"}
            flexDirection={"column"}
            className="coin-field-container"
          >
            <Box display="flex" justifyContent="space-between" className="coin-field-container-title">
              <Typography variant="body2">Deposit Amounts</Typography>
            </Box>
            <TokenInputField
              tokens={tokens}
              selectedToken={liquidityState.token1}
              onAmountChange={handleTokenAmount1}
            />
            <Box
              className="liquidity-token-divider"
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Box
                className="liquidity-token-divider-plus"
              />
            </Box> 
            <TokenInputField
              tokens={tokens}
              selectedToken={liquidityState.token2}
              onAmountChange={handleTokenAmount2}
            />
          </Box>
          { /* <Box
            className="liquidity-pool-summary"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1">0.00034</Typography>
              <Typography variant="subtitle1">CAKE per BNB</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1">24</Typography>
              <Typography variant="subtitle1">BNB per CAKE</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1">3.28%</Typography>
              <Typography variant="subtitle1">Share of Pool</Typography>
            </Box>
          </Box> */}
        </Box>
      </Box>
      <Button
        className={"gradient-button liquidity-add-button"}
        onClick={handleAddLiquidityPool}
        disabled={!liquidityState.token1.address || !liquidityState.token2.address}
      >
        <div className="button-angled-clip">
          <Typography className={"gradient-text"}>Add Liquidity</Typography>
        </div>
      </Button>
    </>
  );
};

export default Liquidity;
