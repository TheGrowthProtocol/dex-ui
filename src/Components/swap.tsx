import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@material-ui/core";
import Coinfield1 from "../Components/coinfield1";
import Coinfield2 from "../Components/coinfield2";
import { Contract, ethers, utils } from "ethers";
import ERC20 from "../build/ERC20.json";
import IUniswapV2Router02 from "../build/IUniswapV2Router02.json";
import { TOKEN } from "../interfaces";
import * as chains from "../constants/chains";
import ConnectWalletButton from "../Components/connectWalletButton";
import { useSnackbar } from "notistack";

const Swap: React.FC<{}> = () => {
  const [amountIn, setAmountIn] = useState(0);
  const [amountOut, setAmountOut] = useState(0);
  const [selectedToken1, setSelectedToken1] = useState<TOKEN>({
    name: "",
    symbol: "",
  });
  const [selectedToken2, setSelectedToken2] = useState<TOKEN>({
    name: "",
    symbol: "",
  });
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();
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

  // TODO: Add logic to amount of token selled and price impact calculation
  useEffect(() => {
    console.log(amountOut);
    setCoinfield2Amount();
  },[amountOut]);

  const getTokenDecimals = async (tokenContract: Contract) => {
    try {
      return await tokenContract.decimals();
    } catch (error) {
      console.warn("No decimals function for token, defaulting to 0:", error);
      return 0;
    }
  };

  const setCoinfield2Amount = async () => {
    try {
      if(!selectedToken1.address || !selectedToken2.address || !signer) {
         throw new Error("Error fetching token details");
      }
      const network = await provider.getNetwork();
      const routerAddress = chains.routerAddress.get(network.chainId);
      const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
      const token1Contract = new Contract(selectedToken1.address, ERC20.abi, signer);
      const token1Decimals = await getTokenDecimals(token1Contract);


      const token2Contract = new Contract(selectedToken2.address, ERC20.abi, signer);
      const token2Decimals = await getTokenDecimals(token2Contract);
      const values_out = await routerContract.getAmountsOut(
        ethers.utils.parseUnits(String(amountOut), token1Decimals),
        [selectedToken1.address, selectedToken2.address]
      );
      const amount_out = values_out[1]*10**(-token2Decimals);
      setAmountIn(Number(amount_out));
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  }

  // TODO: Add logic to selectedToken1 and selectedToken2
  /**useEffect(() => {

    },[])**/

  const handleSwap = async () => {
    try {
      if (
        !provider ||
        !signer ||
        !selectedToken1.address ||
        !selectedToken2.address
      ) {
        throw new Error("Missing required parameters for swap!");
      }
      const network = provider.getNetwork();
      const chainId = (await network).chainId;
      const token1Contract = new Contract(
        selectedToken1.address,
        ERC20.abi,
        signer
      );
      const routerAddress = chains.routerAddress.get(chainId); // Replace with the actual router contract address
      const routerContract = new Contract(
        routerAddress,
        IUniswapV2Router02.abi,
        signer
      );
      // Approve the token transfer
      const approvalTx = await token1Contract.approve(routerAddress, amountIn);
      await approvalTx.wait();

      // Perform the token swap
      const swapTx = await routerContract.swapExactTokensForTokens(
        amountIn,
        amountOut, // Set to 0 for simplicity, but should be the minimum amount out
        [selectedToken1.address, selectedToken2.address],
        await signer.getAddress(),
        Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
      );
      await swapTx.wait();
      enqueueSnackbar("Swap successful!", { variant: "success" });
    } catch (error: any) {
      console.log(error);
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  console.log(amountIn);
  console.log(amountOut);

  return (
    <>
      <Box className="tabpanel-container" sx={{ p: 3 }}>
        <Box className="tabpanel-content">
          <div className="swap-container">
            <Coinfield1
              value={amountOut.toString()}
              setAmount={(amount) => setAmountOut(Number(amount))}
              setSelectedToken={(token: TOKEN) => setSelectedToken1(token)}
            />
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Button variant="contained" color="primary">
                <Typography variant="body1">
                  Swap
                </Typography>
              </Button>
            </Box>
            <Coinfield2
              value={amountIn.toString()}
              setAmount={(amount) => setAmountIn(Number(amount))}
              setSelectedToken={(token: TOKEN) => setSelectedToken2(token)}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1">
                  1 BNB = 0.00016 CAKE ($ 7.02)
                </Typography>
                <Typography variant="body1">
                  Price Impact: $ 1.14 (-2.26%)
                </Typography>
              </Box>
            </Box>
          </div>
        </Box>
      </Box>
      <ConnectWalletButton />
      <Button variant="contained" color="primary" onClick={handleSwap}>
        Swap
      </Button>
    </>
  );
};

export default Swap;
