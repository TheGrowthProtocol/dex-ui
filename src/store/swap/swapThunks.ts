import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import { setLoading, setError, setAmount2, setAmount1 } from "./swapSlice";
import { RootState } from "../store";
import UniswapV2Router02 from "../../build/UniswapV2Router02.json";
import * as chains from "../../constants/chains";
import ERC20 from "../../build/ERC20.json";
import WCERES from "../../build/WCERES.json";

export const swap = createAsyncThunk(
  "swap/swap",
  async (provider: ethers.providers.Web3Provider, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token1, token2, amount1, amount2 } = state.swap;

    try {
      dispatch(setLoading(true));
      if (!token1.address || !token2.address) {
        throw new Error("Missing required parameters for swap!");
      }
      const signer = provider.getSigner();
      const { routerContract, account } = await setupContracts(signer);
      const token1Contract = new Contract(token1.address, ERC20.abi, signer);
      
      const amount1InWei = ethers.utils.parseUnits(amount1.toString(), token1.decimals);
      const amount2InWei = ethers.utils.parseUnits(amount2.toString(), token2.decimals);
      // Approve the token transfer
      const approvalTx = await token1Contract.approve(routerContract.address, amount1InWei); 
      await approvalTx.wait();

      // Add slippage tolerance (e.g., 0.5%)
      const slippageTolerance = 0.995; // 0.5% slippage
      const minAmountOut = amount2InWei.mul(Math.floor(slippageTolerance * 1000)).div(1000);

      // Check balance
      const balance = await token1Contract.balanceOf(account);
      if (balance.lt(amount1InWei)) {
        throw new Error(`Insufficient ${token1.symbol} balance`);
      }

      // Estimate gas with proper parameters
      const gasEstimate = await routerContract.estimateGas.swapExactTokensForTokens(
        amount1InWei,
        minAmountOut,        // Use minimum amount with slippage instead of exact amount
        [token1.address, token2.address],
        account,
        Math.floor(Date.now() / 1000) + 60 * 20,
        { from: account }   
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate.mul(120).div(100);

      // Proceed with swap using the calculated gas limit
      const swapTx = await routerContract.swapExactTokensForTokens(
        amount1InWei,
        minAmountOut,
        [token1.address, token2.address],
        account,
        Math.floor(Date.now() / 1000) + 60 * 20,
        { 
          gasLimit,
          from: account 
        }
      );
      await swapTx.wait();
      dispatch(setLoading(false));
    } catch (error: any) {
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        error.message = "Transaction would fail. Please check your balance and allowance.";
      }
      if (error.code === 'ACTION_REJECTED') {
        error.message = "Transaction rejected by user.";
      }
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const getAmount2 = createAsyncThunk(
  "swap/getAmount2",
  async (provider: ethers.providers.JsonRpcProvider, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token1, token2, amount1 } = state.swap;

    try {
      if (!token1.address || !token2.address) {
        throw new Error("Missing required parameters for swap!");
      }
      const network = await provider.getNetwork();
      const routerAddress = chains.routerAddress.get(network.chainId);
      const routerContract = new Contract(
        routerAddress,
        UniswapV2Router02.abi,
        provider
      );
      const values_out = await routerContract.getAmountsOut(
        ethers.utils.parseUnits(String(amount1), token1.decimals),
        [token1.address, token2.address]
      );
      const amount_out = values_out[1] * 10 ** - token2.decimals;
      dispatch(setAmount2(Number(amount_out.toFixed(2)))); 
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const getAmount1 = createAsyncThunk(
  "swap/getAmount1",
  async (provider: ethers.providers.JsonRpcProvider, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token1, token2, amount2 } = state.swap;

    try {
      if (!token1.address || !token2.address) {
        throw new Error("Missing required parameters for swap!");
      }
      const network = await provider.getNetwork();
      const routerAddress = chains.routerAddress.get(network.chainId);
      const routerContract = new Contract(
        routerAddress,
        UniswapV2Router02.abi,
        provider
      );
      const values_in = await routerContract.getAmountsIn(
        ethers.utils.parseUnits(String(amount2), token2.decimals),
        [token1.address, token2.address]
      );
      const amount_in = values_in[1] * 10 ** - token1.decimals;
      dispatch(setAmount1(Number(amount_in.toFixed(2))));
    } catch (error: any) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

// Helper functions (same as before, but adapted for Redux)
const setupContracts = async (signer: ethers.Signer) => {
  const network = await signer.provider!.getNetwork();
  const routerAddress = chains.routerAddress.get(network.chainId);
  const routerContract = new Contract(
    routerAddress,
    UniswapV2Router02.abi,
    signer
  );
  const account = await signer.getAddress();

  return { routerContract, account };
};
