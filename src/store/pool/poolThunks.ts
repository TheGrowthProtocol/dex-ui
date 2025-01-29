import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import {
  resetSelectedPool,
  setError,
  setLoading,
  setMyPools,
  setPools,
  setSelectedPool,
} from "./poolSlice";
import { formatEther } from "ethers/lib/utils";
import POOL_FACTORY_ABI from "../../build/IUniswapV2Factory.json";
import PAIR_ABI from "../../build/IUniswapV2Pair.json";
import { POOL, TOKEN, Tokenomics } from "../../interfaces";
import { RootState } from "../store";
import * as chains from "../../constants/chains";
import COINS from "../../constants/coins";
import ROUTER from "../../build/UniswapV2Router02.json";
import { env } from "../../env";
const POOL_FACTORY_ADDRESS = env.contracts.poolFactory;
const PRICE_FEED_API = env.priceFeedApi;

export const fetchPools = createAsyncThunk(
  "pools/fetchPools",
  async (provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      // Connect to provider
      const factory = new ethers.Contract(
        POOL_FACTORY_ADDRESS,
        POOL_FACTORY_ABI.abi,
        provider
      );

      // Get all pools
      const poolCount = await factory.allPairsLength();
      const poolsData = await Promise.all(
        Array.from({ length: Number(poolCount) }, async (_, i) => {
          // Get pair address
          const pairID = i.toString();
          const pairAddress = await factory.allPairs(i);
          const pairContract = new ethers.Contract(
            pairAddress,
            PAIR_ABI.abi,
            provider
          );

          // Get tokens
          const token0Address = await pairContract.token0();
          const token1Address = await pairContract.token1();

          // Get token contract details
          const token0Contract = new ethers.Contract(
            token0Address,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ],
            provider
          );
          const token1Contract = new ethers.Contract(
            token1Address,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ],
            provider
          );

          // Fetch token details in parallel
          const [
            token0Name,
            token0Symbol,
            token0Decimals,
            token1Name,
            token1Symbol,
            token1Decimals,
          ] = await Promise.all([
            token0Contract.name(),
            token0Contract.symbol(),
            token0Contract.decimals(),
            token1Contract.name(),
            token1Contract.symbol(),
            token1Contract.decimals(),
          ]);

          const token0Icon = COINS.get(chains.ChainId.TGP)?.find(
            (coin: any) => coin.address === token0Address
          )?.icon;
          const token1Icon = COINS.get(chains.ChainId.TGP)?.find(
            (coin: any) => coin.address === token1Address
          )?.icon;

          const token0: TOKEN = {
            name: token0Name,
            symbol: token0Symbol,
            decimals: token0Decimals,
            address: token0Address,
            icon: token0Icon,
          };
          const token1: TOKEN = {
            name: token1Name,
            symbol: token1Symbol,
            decimals: token1Decimals,
            address: token1Address,
            icon: token1Icon,
          };

          // Get reserves
          const reserves = await pairContract.getReserves();
          const [reserve0, reserve1] = [reserves[0], reserves[1]];

          const token0Reserve = Number(formatEther(reserve0)).toFixed(2);
          const token1Reserve = Number(formatEther(reserve1)).toFixed(2);

          // Get token prices
          const [price0, price1] = await Promise.all([
            getTokenPrice(token0?.symbol ?? ""),
            getTokenPrice(token1?.symbol ?? ""),
          ]);

          // Get volume (Note: You'll need to implement your own volume tracking as
          // Uniswap V2 doesn't track volume directly)
          const volume = await getVolume24h(pairAddress, provider);

          // Calculate TVL
          const tvl =
            parseFloat(formatEther(reserve0)) * price0 +
            parseFloat(formatEther(reserve1)) * price1;

          // Calculate APR
          const apr = calculateAPR(formatEther(volume), tvl.toString());

          // Calculate liquidity (using both reserves)
          const liquidity = ethers.BigNumber.from(
            Math.floor(
              Math.sqrt(
                parseFloat(formatEther(reserve0)) *
                  parseFloat(formatEther(reserve1))
              )
            ).toString()
          );

          let pool: POOL = {
            id: pairID,
            pairAddress: pairAddress,
            token0: token0 ?? {
              name: "",
              symbol: "",
              decimals: 0,
              address: "",
            },
            token1: token1 ?? {
              name: "",
              symbol: "",
              decimals: 0,
              address: "",
            },
            token0Reserve: token0Reserve,
            token1Reserve: token1Reserve,
            //token0Symbol,
            //token1Symbol,
            liquidity: formatEther(liquidity),
            volume24h: formatEther(volume),
            tvl: Number(tvl).toFixed(2),
            apr: apr.toString(),
          };
          return pool;
        })
      );
      dispatch(setPools(poolsData));
      dispatch(setLoading(false));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const fetchMyPools = createAsyncThunk(
  "pools/fetchMyPools",
  async (provider: ethers.providers.Web3Provider, { getState, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const state = getState() as RootState;
      // Connect to provider
      const factory = new ethers.Contract(
        POOL_FACTORY_ADDRESS,
        POOL_FACTORY_ABI.abi,
        provider
      );
      const account = state.wallet.address;

      // Get all pools
      const poolCount = await factory.allPairsLength();
      const poolsData = await Promise.all(
        Array.from({ length: Number(poolCount) }, async (_, i) => {
          // Get pair address
          const pairID = i.toString();
          const pairAddress = await factory.allPairs(i);
          const pairContract = new ethers.Contract(
            pairAddress,
            PAIR_ABI.abi,
            provider
          );

          // Get tokens
          const token0Address = await pairContract.token0();
          const token1Address = await pairContract.token1();

          // Get token contract details
          const token0Contract = new ethers.Contract(
            token0Address,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ],
            provider
          );
          const token1Contract = new ethers.Contract(
            token1Address,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ],
            provider
          );

          // Fetch token details in parallel
          const [
            token0Name,
            token0Symbol,
            token0Decimals,
            token1Name,
            token1Symbol,
            token1Decimals,
          ] = await Promise.all([
            token0Contract.name(),
            token0Contract.symbol(),
            token0Contract.decimals(),
            token1Contract.name(),
            token1Contract.symbol(),
            token1Contract.decimals(),
          ]);
          const token0Icon = COINS.get(chains.ChainId.TGP)?.find(
            (coin: any) => coin.address === token0Address
          )?.icon;
          const token1Icon = COINS.get(chains.ChainId.TGP)?.find(
            (coin: any) => coin.address === token1Address
          )?.icon;

          const token0: TOKEN = {
            name: token0Name,
            symbol: token0Symbol,
            decimals: token0Decimals,
            address: token0Address,
            icon: token0Icon,
          };
          const token1: TOKEN = {
            name: token1Name,
            symbol: token1Symbol,
            decimals: token1Decimals,
            address: token1Address,
            icon: token1Icon,
          };

          // Get reserves
          const reserves = await pairContract.getReserves();
          const [reserve0, reserve1] = [reserves[0], reserves[1]];

          const token0Reserve = Number(formatEther(reserve0)).toFixed(2);
          const token1Reserve = Number(formatEther(reserve1)).toFixed(2);

          // Get total supply
          const totalSupply = await pairContract.totalSupply();

          // Get token prices
          const [price0, price1] = await Promise.all([
            getTokenPrice(token0?.symbol ?? ""),
            getTokenPrice(token1?.symbol ?? ""),
          ]);

          // Get TBL
          const tvl = (
            Number(token0Reserve) * price0 +
            Number(token1Reserve) * price1
          ).toFixed(2);

          // Get user balance
          const userLPBalance = await pairContract.balanceOf(account);

          // Calculate user's share percentage
          const userSharePercent = userLPBalance
            .mul(ethers.constants.WeiPerEther)
            .div(totalSupply);

          // Calculate user's token shares
          const token0Share = reserve0
            .mul(userSharePercent)
            .div(ethers.constants.WeiPerEther);
          const token1Share = reserve1
            .mul(userSharePercent)
            .div(ethers.constants.WeiPerEther);

          // Calculate liquidity (using both reserves)
          const liquidity = ethers.BigNumber.from(
            Math.floor(
              Math.sqrt(
                parseFloat(formatEther(reserve0)) *
                  parseFloat(formatEther(reserve1))
              )
            ).toString()
          );

          // Get volume (Note: You'll need to implement your own volume tracking as
          // Uniswap V2 doesn't track volume directly)
          //const volume = await getVolume24h(pairAddress, provider);

          let pool: POOL = {
            id: pairID,
            pairAddress: pairAddress,
            token0: token0 ?? {
              name: "",
              symbol: "",
              decimals: 0,
              address: "",
            },
            token1: token1 ?? {
              name: "",
              symbol: "",
              decimals: 0,
              address: "",
            },
            token0Reserve: token0Reserve,
            token1Reserve: token1Reserve,
            token0Share: Number(formatEther(token0Share)).toFixed(2),
            token1Share: Number(formatEther(token1Share)).toFixed(2),
            liquidity: Number(formatEther(liquidity)).toFixed(2),
            lpBalance: Number(formatEther(userLPBalance)).toFixed(2),
            tvl: Number(tvl).toFixed(2),
          };
          return pool;
        })
      );
      dispatch(setMyPools(poolsData));
      dispatch(setLoading(false));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw new Error("Failed to fetch my pools");
    }
  }
);

export const fetchPoolByTokenAddresses = createAsyncThunk(
  "pools/fetchPoolByTokenAddresses",
  async (tokenAddresses: string[], { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const pool = state.pool.pools.find(
        (pool: POOL) =>
          tokenAddresses.includes(pool.token0.address ?? "") &&
          tokenAddresses.includes(pool.token1.address ?? "")
      );
      if (pool) {
        dispatch(setSelectedPool(pool));
      } else {
        dispatch(resetSelectedPool());
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const selectPool = createAsyncThunk(
  "pools/selectPool",
  async (poolId: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const pool = state.pool.myPools.find((pool: POOL) => pool.id === poolId);
    if (pool) {
      dispatch(setSelectedPool(pool));
    }
  }
);

export const fetchShareBalances = createAsyncThunk(
  "pools/fetchShareBalances",
  async (params: { pool: POOL; lpBalance: number , provider: ethers.providers.Web3Provider}, { getState, dispatch }) => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet.");
      }
      const pairContract = new ethers.Contract(
        params.pool.pairAddress,
        PAIR_ABI.abi,
        params.provider
      );
      const reserves = await pairContract.getReserves();
      const [reserve0, reserve1] = [reserves[0], reserves[1]];
      const totalSupply = await pairContract.totalSupply();
      const userLPBalance = ethers.utils.parseEther(
        params.lpBalance.toString()
      );

      // Calculate user's share percentage
      const userSharePercent = userLPBalance
        .mul(ethers.constants.WeiPerEther)
        .div(totalSupply);

      // Calculate user's token shares
      const token0Share = reserve0
        .mul(userSharePercent)
        .div(ethers.constants.WeiPerEther);
      const token1Share = reserve1
        .mul(userSharePercent)
        .div(ethers.constants.WeiPerEther);
      dispatch(setLoading(false));
      return {
        token0Share: {
          token: params.pool.token0,
          amount: Number(formatEther(token0Share)).toFixed(2),
        },
        token1Share: {
          token: params.pool.token1,
          amount: Number(formatEther(token1Share)).toFixed(2),
        },
      };
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const removeLpToken = createAsyncThunk(
  "pools/removeLpToken",
  async (params: { provider: ethers.providers.Web3Provider}, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const selectedPool = state.pool.selectedPool;
      if (!selectedPool) {
        throw new Error("No selected pool");
      }
      const provider = params.provider;

      const token0Share = state.pool.removeLpToken0Share?.amount;
      const token1Share = state.pool.removeLpToken1Share?.amount;
      const token0Decimals = selectedPool.token0.decimals;
      const token1Decimals = selectedPool.token1.decimals;
      const token0ShareAmount = ethers.utils.parseUnits(
        token0Share ?? "0",
        token0Decimals
      );
      const token1ShareAmount = ethers.utils.parseUnits(
        token1Share ?? "0",
        token1Decimals
      );
      const time = Math.floor(Date.now() / 1000) + 200000;
      const deadline = ethers.BigNumber.from(time);
      const liquidity = ethers.utils.parseUnits(
        state.pool.removeLpTokenBalance ?? "0",
        18
      );
      const network = await provider.getNetwork();
      const account = state.wallet.address;
      const signer = provider.getSigner();
      const pairContract = new Contract(
        selectedPool.pairAddress,
        PAIR_ABI.abi,
        signer
      );
      const routerContract = new Contract(
        chains.routerAddress.get(network.chainId),
        ROUTER.abi,
        provider.getSigner()
      );

      try {
        const wethAddress = await routerContract.WCERES();

        await pairContract.approve(routerContract.address, liquidity);

        if (selectedPool.token0.address === wethAddress) {
          await routerContract.removeLiquidityCERES(
            selectedPool.token1.address,
            liquidity,
            token1ShareAmount,
            token0ShareAmount,
            account,
            deadline,
            { gasLimit: 500000 }
          );
        } else if (selectedPool.token1.address === wethAddress) {
          await routerContract.removeLiquidityCERES(
            selectedPool.token0.address,
            liquidity,
            token0ShareAmount,
            token1ShareAmount,
            account,
            deadline,
            { gasLimit: 500000 }
          );
        } else {
          await routerContract.removeLiquidity(
            selectedPool.token0.address,
            selectedPool.token1.address,
            liquidity,
            token0ShareAmount,
            token1ShareAmount,
            account,
            deadline,
            { gasLimit: 500000 }
          );
        }
      } catch (error) {
        console.error("Detailed error:", error);
        throw error;
      }
      dispatch(setLoading(false));
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

export const fetchPoolTokenomics = createAsyncThunk(
  "pools/fetchPoolTokenomics",
  async (
    params: { pool: POOL; swapAmount1: number; swapAmount2: number },
    { getState, dispatch }
  ) => {
    try {
      const tokenomics = calculateTokenomics({
        pool: params.pool,
        swapAmount1: params.swapAmount1,
        swapAmount2: params.swapAmount2,
      });
      return tokenomics;
    } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

// Helper functions

const calculateTokenomics = (params: {
  pool: POOL;
  swapAmount1: number;
  swapAmount2: number;
}) => {
  const { pool, swapAmount1, swapAmount2 } = params;
  const token0Reserve = pool.token0Reserve;
  const token1Reserve = pool.token1Reserve;
  const currentRatio = Number(token0Reserve) / Number(token1Reserve);
  let newRatio = 0;
  let priceImpact = 0;
  if (swapAmount1 > 0 && swapAmount2 > 0) {
    newRatio =
      (Number(token0Reserve) - swapAmount1) /
      (Number(token1Reserve) + swapAmount2);
    priceImpact = (newRatio - currentRatio) / currentRatio;
  }
  const feeTier = 0;
  const token0perToken1 = swapAmount1 / (Number(token0Reserve) - swapAmount1);
  const token1perToken0 = swapAmount2 / (Number(token1Reserve) - swapAmount2);

  let tokenomics: Tokenomics = {};
  tokenomics.priceImpact = {
    title: "Price Impact",
    value: priceImpact.toString(),
  };
  tokenomics.feeTier = { title: "Fee Tier", value: feeTier.toString() };
  tokenomics.token0perToken1 = {
    title: "Token 0 per Token 1",
    value: token0perToken1.toString(),
  };
  tokenomics.token1perToken0 = {
    title: "Token 1 per Token 0",
    value: token1perToken0.toString(),
  };
  tokenomics.token0 = { title: "Token 0", value: pool.token0.symbol };
  tokenomics.token1 = { title: "Token 1", value: pool.token1.symbol };
  tokenomics.apr = { title: "APR", value: pool.apr ?? "0" };
  tokenomics.volume24h = { title: "Volume 24h", value: pool.volume24h ?? "0" };
  tokenomics.tvl = { title: "TVL", value: pool.tvl ?? "0" };
  tokenomics.liquidity = { title: "Liquidity", value: pool.liquidity ?? "0" };
  tokenomics.currentRatio = {
    title: "Current Ratio",
    value: currentRatio.toString(),
  };
  tokenomics.newRatio = { title: "New Ratio", value: newRatio.toString() };
  tokenomics.currentLPRate = { title: "Current LPRate", value: "0" };
  tokenomics.swapAmount1 = {
    title: "Swap Amount 1",
    value: swapAmount1.toString(),
  };
  tokenomics.swapAmount2 = {
    title: "Swap Amount 2",
    value: swapAmount2.toString(),
  };
  return tokenomics;
};

const getVolume24h = async (
  pairAddress: string,
  provider: ethers.providers.Provider
) => {
  // This is a placeholder. You'll need to:
  // 1. Either use a subgraph to get historical data
  // 2. Or track events and calculate volume yourself
  // 3. Or integrate with an API that provides this data

  // For now, returning mock data
  return ethers.utils.parseEther("1000");
};

const getTokenPrice = async (tokenSymbol: string): Promise<number> => {
  try {
    /*const response = await fetch(`${PRICE_FEED_API}/${tokenSymbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${tokenSymbol}`);
    }
    const data = await response.json();*/
    return 1;
  } catch (error) {
    console.error(error);
    return 1;
  }
};

const DAILY_FEES_PERCENT = 0.003; // 0.3% fee per trade
const DAYS_PER_YEAR = 365;
const calculateAPR = (volume24h: string, tvl: string): string => {
  try {
    // Convert strings to numbers
    const dailyVolume = parseFloat(volume24h);
    const totalValueLocked = parseFloat(tvl);

    if (totalValueLocked <= 0) return "0";

    // Calculate daily fees earned
    const dailyFees = dailyVolume * DAILY_FEES_PERCENT;

    // Project to yearly fees
    const yearlyFees = dailyFees * DAYS_PER_YEAR;

    // Calculate APR
    const apr = (yearlyFees / totalValueLocked) * 100;

    // Return formatted APR with 2 decimal places
    return apr.toFixed(2);
  } catch (error) {
    console.error("Error calculating APR:", error);
    return "0";
  }
};
