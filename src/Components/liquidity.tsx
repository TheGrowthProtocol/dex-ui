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
    /*try {
      if (!liquidityState.token1.address || !liquidityState.token2.address) {
        throw new Error("No selected token addresses.");
      }

      // Get network and contract setup
      const { routerContract, account } = await setupContracts();

      // Get token details and amounts
      const {
        token1Contract,
        token2Contract,
        amountIn1,
        amountIn2,
        amount1Min,
        amount2Min,
        deadline
      } = await prepareTokenDetails();

      // Approve tokens
      await approveTokens(token1Contract, token2Contract, routerContract, amountIn1, amountIn2);

      // Add liquidity
      await executeLiquidityTransaction(routerContract, {
        token1Address: liquidityState.token1.address,
        token2Address: liquidityState.token2.address,
        amountIn1,
        amountIn2,
        amount1Min,
        amount2Min,
        account,
        deadline
      });

    } catch (error) {
      console.error("Failed to add liquidity:", error);
      // Here you might want to show an error notification to the user
    }*/
    dispatch(addLiquidity());
  };

  // Helper functions
  const setupContracts = async () => {
    const network = await provider.getNetwork();
    const routerAddress = chains.routerAddress.get(network.chainId);
    const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
    const account = await signer.getAddress();
    
    return { routerContract, account };
  };

  const getTokenDecimals = async (tokenContract: Contract) => {
    try {
      return await tokenContract.decimals();
    } catch (error) {
      console.warn("No decimals function for token, defaulting to 0:", error);
      return 0;
    }
  };

  /**
   * Prepares the token details for the liquidity transaction
   * @description This function prepares the token details for the liquidity transaction based on the selected token pair and the selected network.
   * @returns {Object} - The token details for the liquidity transaction.
   */
  const prepareTokenDetails = async () => {
    if (!liquidityState.token1.address || !liquidityState.token2.address) {
      throw new Error("No selected token addresses.");
    }

    const token1Contract = new Contract(liquidityState.token1.address, ERC20.abi, signer);
    const token2Contract = new Contract(liquidityState.token2.address, ERC20.abi, signer);

    const [token1Decimals, token2Decimals] = await Promise.all([
      getTokenDecimals(token1Contract),
      getTokenDecimals(token2Contract)
    ]);

    const amountIn1 = ethers.utils.parseUnits(liquidityState.amount1, token1Decimals);
    const amountIn2 = ethers.utils.parseUnits(liquidityState.amount2, token2Decimals);
    const amount1Min = ethers.utils.parseUnits(liquidityState.amount1Min, token1Decimals);
    const amount2Min = ethers.utils.parseUnits(liquidityState.amount2Min, token2Decimals);
    
    const deadline = ethers.BigNumber.from(Math.floor(Date.now() / 1000) + 200000);

    return {
      token1Contract,
      token2Contract,
      amountIn1,
      amountIn2,
      amount1Min,
      amount2Min,
      deadline
    };
  };

  const approveTokens = async (
    token1Contract: Contract,
    token2Contract: Contract,
    routerContract: Contract,
    amountIn1: ethers.BigNumber,
    amountIn2: ethers.BigNumber
  ) => {
    await Promise.all([
      token1Contract.approve(routerContract.address, amountIn1),
      token2Contract.approve(routerContract.address, amountIn2)
    ]);
  };

  interface LiquidityParams {
    token1Address: string;
    token2Address: string;
    amountIn1: ethers.BigNumber;
    amountIn2: ethers.BigNumber;
    amount1Min: ethers.BigNumber;
    amount2Min: ethers.BigNumber;
    account: string;
    deadline: ethers.BigNumber;
  }

  
  /**
   * Executes the liquidity transaction
   * @description This function handles the liquidity transaction based on the selected token pair and the selected network.
   * @param routerContract - The router contract instance.
   * @param params - The parameters for the liquidity transaction.
   */
  const executeLiquidityTransaction = async (routerContract: Contract, params: LiquidityParams) => {
    const wethAddress = await routerContract.WCERES();
    
    if (params.token1Address === wethAddress) {
      // ETH + Token
      await routerContract.addLiquidityCERES(
        params.token2Address,
        params.amountIn2,
        params.amount2Min,
        params.amount1Min,
        params.account,
        params.deadline,
        { value: params.amountIn1 }
      );
    } else if (params.token2Address === wethAddress) {
      // Token + ETH
      await routerContract.addLiquidityCERES(
        params.token1Address,
        params.amountIn1,
        params.amount1Min,
        params.amount2Min,
        params.account,
        params.deadline,
        { value: params.amountIn2 }
      );
    } else {
      // Token + Token
      await routerContract.addLiquidity(
        params.token1Address,
        params.token2Address,
        params.amountIn1,
        params.amountIn2,
        params.amount1Min,
        params.amount2Min,
        params.account,
        params.deadline
      );
    }
  };

  return (
    <>
      <Box className="tabpanel-container" sx={{ p: 3 }}>
        <Box className="tabpanel-content">
          <Box
            display="flex"
            flexDirection="column"
            className="coin-field-container"
          >
            <Typography variant="subtitle2">Select Token Pair</Typography>
            <Box display="flex">
              <Button
                variant="contained"
                onClick={() => setOpenToken1Dialog(true)}
                endIcon={<KeyboardArrowDownIcon />}
              >
                {liquidityState.token1.symbol || "Select Token"}
              </Button>
              <Coindialog
                tokens={tokens}
                isOpen={openToken1Dialog}
                handleClose={handleToken1DialogClose}
                onTokenSelect={handleToken1Select}
              />
              <Typography variant="h6">+</Typography>
              <Button
                variant="contained"
                onClick={() => setOpenToken2Dialog(true)}
                endIcon={<KeyboardArrowDownIcon />}
              >
                {liquidityState.token2.symbol || "Select Token"} 
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
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Deposit Amounts</Typography>
            </Box>
            <TokenInputField
              tokens={tokens}
              selectedToken={liquidityState.token1}
              onAmountChange={handleTokenAmount1}
            />
            <TokenInputField
              tokens={tokens}
              selectedToken={liquidityState.token2}
              onAmountChange={handleTokenAmount2}
            />
          </Box>
          <Box
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
          </Box>
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
