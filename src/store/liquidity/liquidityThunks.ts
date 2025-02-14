import { createAsyncThunk } from '@reduxjs/toolkit';
import { ethers, Contract } from 'ethers';
import { setLoading, setError } from './liquiditySlice';
import { RootState } from '../store';
import IUniswapV2Router02 from '../../build/IUniswapV2Router02.json';
import * as chains from '../../constants/chains';
import { TOKEN } from '../../interfaces';
import ERC20 from '../../build/ERC20.json';
import WCERES from '../../build/WCERES.json';

export const addLiquidity = createAsyncThunk(
  'liquidity/addLiquidity',
  async (provider: ethers.providers.Web3Provider, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { token1, token2, amount1, amount2, amount1Min, amount2Min } = state.liquidity;

    try {
      dispatch(setLoading(true));
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed!');
      }

      const signer = provider.getSigner();
      const { routerContract, account } = await setupContracts(signer);
      const tokenDetails = await prepareTokenDetails(token1, token2, amount1, amount2, amount1Min, amount2Min, signer);
      // Add balance checks
      const [balance1, balance2] = await Promise.all([
        token1.address === await routerContract.WCERES() 
          ? provider.getBalance(await signer.getAddress())
          : tokenDetails.token1Contract.balanceOf(await signer.getAddress()),
        token2.address === await routerContract.WCERES()
          ? provider.getBalance(await signer.getAddress())
          : tokenDetails.token2Contract.balanceOf(await signer.getAddress())
      ]);

      if (balance1.lt(tokenDetails.amountIn1)) {
        throw new Error(`Insufficient ${token1.symbol} balance`);
      }
      if (balance2.lt(tokenDetails.amountIn2)) {
        throw new Error(`Insufficient ${token2.symbol} balance`);
      }
      
      await approveTokens(tokenDetails.token1Contract, tokenDetails.token2Contract, routerContract, tokenDetails.amountIn1, tokenDetails.amountIn2);
      
      await executeLiquidityTransaction(routerContract, {
        token1Address: token1.address,
        token2Address: token2.address,
        ...tokenDetails,
        account,
      });

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
  const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
  const account = await signer.getAddress();
  
  return { routerContract, account };
};


/**
   * Executes the liquidity transaction
   * @description This function handles the liquidity transaction based on the selected token pair and the selected network.
   * @param routerContract - The router contract instance.
   * @param params - The parameters for the liquidity transaction.
   */

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

const executeLiquidityTransaction = async (routerContract: Contract, params: LiquidityParams) => {
    const wethAddress = await routerContract.WCERES();
    
    
    if (params.token1Address === wethAddress) {
      /*let gasLimit = await routerContract.estimateGas.addLiquidityCERES(
        params.token2Address,
        params.amountIn2,
        params.amount2Min,
        params.amount1Min,
        params.account,
        params.deadline,
        { value: params.amountIn1 },
    );*/
      // ETH + Token
      await routerContract.addLiquidityCERES(
        params.token2Address,
        params.amountIn2,
        params.amount2Min,
        params.amount1Min,
        params.account,
        params.deadline,
        { value: params.amountIn1 },
        //{ gasLimit: 5000000 }
      );
    } else if (params.token2Address === wethAddress) {
      /*let gasLimit = await routerContract.estimateGas.addLiquidityCERES(
        params.token1Address,
        params.amountIn1,
        params.amount1Min,
        params.amount2Min,
        params.account,
        params.deadline,
        { value: params.amountIn2 }
      );*/
      // Token + ETH
      await routerContract.addLiquidityCERES(
        params.token1Address,
        params.amountIn1,
        params.amount1Min,
        params.amount2Min,
        params.account,
        params.deadline,
        { value: params.amountIn2 },
        //{ gasLimit: 5000000 }
      );
    } else {
      // Token + Token
      /*let gasLimit = await routerContract.estimateGas.addLiquidity(
        params.token1Address,
        params.token2Address,
        params.amountIn1,
        params.amountIn2,
        params.amount1Min,
        params.amount2Min,
        params.account,
        params.deadline
      );

      console.log(gasLimit);*/
      await routerContract.addLiquidity(
        params.token1Address,
        params.token2Address,
        params.amountIn1,
        params.amountIn2,
        params.amount1Min,
        params.amount2Min,
        params.account,
        params.deadline,
        //{ gasLimit: gasLimit }
      );
    }
  };

  const approveTokens = async (
    token1Contract: Contract,
    token2Contract: Contract,
    routerContract: Contract,
    amountIn1: ethers.BigNumber,
    amountIn2: ethers.BigNumber
  ) => {
    try {
      // Check current allowances first
      const [allowance1, allowance2] = await Promise.all([
        token1Contract.allowance(await token1Contract.signer.getAddress(), routerContract.address),
        token2Contract.allowance(await token2Contract.signer.getAddress(), routerContract.address)
      ]);

      const approvalPromises = [];

      // Only approve if needed
      if (allowance1.lt(amountIn1)) {
        approvalPromises.push(
          token1Contract.approve(routerContract.address, amountIn1)
            .then((tx: any) => tx.wait()) // Wait for transaction confirmation
        );
      }

      if (allowance2.lt(amountIn2)) {
        approvalPromises.push(
          token2Contract.approve(routerContract.address, amountIn2)
            .then((tx: any) => tx.wait()) // Wait for transaction confirmation
        );
      }

      // Wait for all necessary approvals
      if (approvalPromises.length > 0) {
        await Promise.all(approvalPromises);
      }
    } catch (error: any) {
      // Improve error handling
      if (error.code === -32603) {
        throw new Error("Transaction failed. Please check your wallet and try again.");
      } else if (error.message?.includes("user rejected")) {
        throw new Error("Transaction was rejected by user.");
      } else {
        console.error("Approval error:", error);
        throw new Error("Failed to approve tokens. Please try again.");
      }
    }
  };

  /**
   * Prepares the token details for the liquidity transaction
   * @description This function prepares the token details for the liquidity transaction based on the selected token pair and the selected network.
   * @returns {Object} - The token details for the liquidity transaction.
   */
  const prepareTokenDetails = async (token1: TOKEN, token2: TOKEN, amount1: string, amount2: string, amount1min: string, amount2min: string, signer: ethers.Signer) => {
    if (!token1.address || !token2.address) {
      throw new Error("No selected token addresses.");
    }

    const token1Contract = new Contract(token1.address, token1.name === "CERES" ? WCERES.abi : ERC20.abi, signer);
    const token2Contract = new Contract(token2.address, token2.name === "CERES" ? WCERES.abi : ERC20.abi, signer);

    const [token1Decimals, token2Decimals] = await Promise.all([
      getTokenDecimals(token1Contract),
      getTokenDecimals(token2Contract)
    ]);

    const amountIn1 = ethers.utils.parseUnits(amount1, token1Decimals);
    const amountIn2 = ethers.utils.parseUnits(amount2, token2Decimals);
    const amount1Min = ethers.utils.parseUnits(amount1min, token1Decimals);
    const amount2Min = ethers.utils.parseUnits(amount2min, token2Decimals);
    
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

  const getTokenDecimals = async (tokenContract: Contract) => {
    try {
      return await tokenContract.decimals();
    } catch (error) {
      console.warn("No decimals function for token, defaulting to 0:", error);
      return 0;
    }
  };
