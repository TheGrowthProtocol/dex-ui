import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import { setLoading, setError, setAmount2 } from "./swapSlice";
import { RootState } from "../store";
import IUniswapV2Router02 from "../../build/IUniswapV2Router02.json";
import * as chains from "../../constants/chains";

const ERC20 = require("../../build/ERC20.json");

export const swap = createAsyncThunk(
  "swap/swap",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token1, token2, amount1, amount2 } = state.swap;

    try {
      dispatch(setLoading(true));
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }
      if (!token1.address || !token2.address) {
        throw new Error("Missing required parameters for swap!");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const { routerContract, account } = await setupContracts(signer);
      const token1Contract = new Contract(token1.address, ERC20.abi, signer);

      const amount1InWei = ethers.utils.parseUnits(amount1.toString());
      const amount2InWei = ethers.utils.parseUnits(amount2.toString());
      // Approve the token transfer
      const approvalTx = await token1Contract.approve(routerContract.address, amount1InWei); 
      await approvalTx.wait();

      // Perform the token swap
      const swapTx = await routerContract.swapExactTokensForTokens(
        amount1InWei,
        amount2InWei,
        [token1.address, token2.address],
        account,
        Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
      );
      await swapTx.wait();
      dispatch(setLoading(false));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const getAmount2 = createAsyncThunk(
  "swap/getAmount2",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token1, token2, amount1 } = state.swap;

    try {
      dispatch(setLoading(true));
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }
      if (!token1.address || !token2.address) {
        throw new Error("Missing required parameters for swap!");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      const routerAddress = chains.routerAddress.get(network.chainId);
      const routerContract = new Contract(
        routerAddress,
        IUniswapV2Router02.abi,
        signer
      );
      const token1Contract = new Contract(token1.address, ERC20.abi, signer);
      const token1Decimals = await getTokenDecimals(token1Contract);

      const token2Contract = new Contract(token2.address, ERC20.abi, signer);
      const token2Decimals = await getTokenDecimals(token2Contract);
      const values_out = await routerContract.getAmountsOut(
        ethers.utils.parseUnits(String(amount1), token1Decimals),
        [token1.address, token2.address]
      );
      const amount_out = values_out[1] * 10 ** -token2Decimals;
      dispatch(setAmount2(Number(amount_out.toFixed(2))));
      dispatch(setLoading(false));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
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
    IUniswapV2Router02.abi,
    signer
  );
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
