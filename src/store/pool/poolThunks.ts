import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers, Contract } from "ethers";
import COINS from "../../constants/coins";
import WCERES from "../../build/WCERES.json";
import ERC20 from "../../build/ERC20.json";
import { setError, setLoading, setMyPools, setPools, setRemoveLpToken0Share, setRemoveLpToken1Share, setSelectedPool } from "./poolSlice";
import { formatEther } from "ethers/lib/utils";
import POOL_FACTORY_ABI from "../../build/IUniswapV2Factory.json";
import PAIR_ABI from "../../build/IUniswapV2Pair.json";
import { POOL, TOKEN } from "../../interfaces";
import { RootState } from "../store";
const POOL_FACTORY_ADDRESS = "0xeD3D02Dc6C18C2911D4fFc32ad6C6ABe3B279FE9";
const PRICE_FEED_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=ceres&vs_currencies=usd";

/*const TGP_NETWORK = {
  chainId: "0x17c99", // Convert 97433 to hex
  chainName: "TGP Testnet",
  rpcUrls: ["https://subnets.avax.network/tgp/testnet/rpc"],
  nativeCurrency: {
    name: "CERES",
    symbol: "CERES",
    decimals: 18,
  },
  blockExplorerUrls: ["https://subnets-test.avax.network/tgp"],
};*/

export const fetchPools = createAsyncThunk(
  "pools/fetchPools",
  async (_, { getState, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const state = getState() as RootState;
      const tokens = state.tokens.tokens;
      if (!window.ethereum) {
        throw new Error("Metamask not installed");
      }
      // Connect to provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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
          const token0Address  = await pairContract.token0();
          const token1Address = await pairContract.token1();
          const [token0Symbol, token1Symbol] = await Promise.all([
            getTokenSymbol(token0Address, provider),
            getTokenSymbol(token1Address, provider),
          ]);

          const token0 = tokens.find((token: TOKEN) => token.address === token0Address);
          const token1 = tokens.find((token: TOKEN) => token.address === token1Address);


          // Get reserves
          const reserves = await pairContract.getReserves();
          const [reserve0, reserve1] = [reserves[0], reserves[1]];

          // Get token prices
          const [price0, price1] = await Promise.all([
            getTokenPrice(token0Symbol),
            getTokenPrice(token1Symbol),
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
            token0: token0 ?? { name: "", symbol: "", decimals: 0, address: "" },
            token1: token1 ?? { name: "", symbol: "", decimals: 0, address: "" },
            //token0Symbol,
            //token1Symbol,
            liquidity: formatEther(liquidity),
            volume24h: formatEther(volume),
            tvl: tvl.toString(),
            apr: apr.toString(),
          };
          return pool;
        })
      );
      console.log(poolsData);
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
  async (_, { getState, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const state = getState() as RootState;
      const tokens = state.tokens.tokens;
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet.");
      }
      // Connect to provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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
          const [token0Symbol, token1Symbol] = await Promise.all([
            getTokenSymbol(token0Address, provider),
            getTokenSymbol(token1Address, provider),
          ]);

          const token0 = tokens.find((token: TOKEN) => token.address === token0Address);
          const token1 = tokens.find((token: TOKEN) => token.address === token1Address);

          // Get reserves
          const reserves = await pairContract.getReserves();
          const [reserve0, reserve1] = [reserves[0], reserves[1]];

          // Get total supply
          const totalSupply = await pairContract.totalSupply();

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
            token0: token0 ?? { name: "", symbol: "", decimals: 0, address: "" },
            token1: token1 ?? { name: "", symbol: "", decimals: 0, address: "" },
            //token0Symbol,
            //token1Symbol,
            token0Share: Number(formatEther(token0Share)).toFixed(2),
            token1Share: Number(formatEther(token1Share)).toFixed(2),
            liquidity: Number(formatEther(liquidity)).toFixed(2),
            lpBalance: Number(formatEther(userLPBalance)).toFixed(2),
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
  async (params: { pool: POOL; lpBalance: number }, { getState, dispatch }) => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet.");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const pairContract = new ethers.Contract(
        params.pool.pairAddress,
        PAIR_ABI.abi,
        provider
      );
      const reserves = await pairContract.getReserves();
      const [reserve0, reserve1] = [reserves[0], reserves[1]];
      const totalSupply = await pairContract.totalSupply();
      const userLPBalance = ethers.utils.parseEther(params.lpBalance.toString());

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
        console.log("token0Share", Number(formatEther(token0Share)).toFixed(2));
        console.log("token1Share", Number(formatEther(token1Share)).toFixed(2));
        //dispatch(setRemoveLpToken0Share({ token: params.pool.token0, amount: Number(formatEther(token0Share)).toFixed(2) }));
        //dispatch(setRemoveLpToken1Share({ token: params.pool.token1, amount: Number(formatEther(token1Share)).toFixed(2) }));
        //dispatch(setLoading(false));
        return {
          token0Share: { token: params.pool.token0, amount: Number(formatEther(token0Share)).toFixed(2) },
          token1Share: { token: params.pool.token1, amount: Number(formatEther(token1Share)).toFixed(2) },
        };
  } catch (error: any) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      throw error;
    }
  }
);

// Helper functions
const getTokenSymbol = async (
  tokenAddress: string,
  provider: ethers.providers.Provider
) => {
  const tokenABI = ["function symbol() view returns (string)"];
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
  return await tokenContract.symbol();
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
    const response = await fetch(`${PRICE_FEED_API}/${tokenSymbol}`);
    const data = await response.json();
    return data.price;
  } catch (error) {
    console.error(`Error fetching price for ${tokenSymbol}:`, error);
    return 0;
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
