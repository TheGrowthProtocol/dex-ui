import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Table,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CustomizedMenus from "./styledMenu";
import { ethers } from "ethers";
import MASTER_CHEF_ABI from "../build/MasterChef.json";
import POOL_FACTORY_ABI from "../build/IUniswapV2Factory.json";
import PAIR_ABI from "../build/IUniswapV2Pair.json";
import { formatEther } from "ethers/lib/utils";
import { MenuItemProps } from "../interfaces";
import AddStakeDialog from "./addStackDialog";
import RemoveStakeDialog from "./removeStackDialog";

const MASTER_CHEF_ADDRESS = "0x481b2c832322F73Ec66e4f9e013001db9B55518a";
const POOL_FACTORY_ADDRESS = "0xeD3D02Dc6C18C2911D4fFc32ad6C6ABe3B279FE9";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  tableContainer: {
    maxHeight: 440,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
}));

interface Pool {
  id: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: string;
  volume24h?: string;
  token0Share?: string;
  token1Share?: string;
  tvl?: string;
  apr?: string;
}

const Staking: React.FC<{}> = () => {
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const [allPools, setAllPools] = useState<Pool[]>([]);
  const [openAddStakeDialog, setOpenAddStakeDialog] = useState(false);
  const [openRemoveStakeDialog, setOpenRemoveStakeDialog] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  useEffect(() => {
    fetchPools();
    setLoading(false);
  }, []);

  const fetchPools = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Metamask not installed");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const poolFactory = new ethers.Contract(
        POOL_FACTORY_ADDRESS,
        POOL_FACTORY_ABI.abi,
        provider
      );
      const poolCount = await poolFactory.allPairsLength();
      console.log(poolCount);
      const poolsData = await Promise.all(
        Array.from({ length: Number(poolCount) }, async (_, i) => {
          // Get pair address
          const pairAddress = await poolFactory.allPairs(i);
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

          return {
            id: pairAddress,
            token0Address,
            token1Address,
            token0Symbol,
            token1Symbol,
            liquidity: formatEther(liquidity),
            volume24h: formatEther(volume),
            tvl: tvl.toString(),
            apr: apr.toString(),
          };
        })
      );
      setAllPools(poolsData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTransact = async (value: string, poolId: string) => {
    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();
      const pairContract = new ethers.Contract(poolId, PAIR_ABI.abi, signer);
      // approve value  need to be in wei
      const valueInWei = ethers.utils.parseUnits(value.toString(), 18);
      const approveTx = await pairContract.approve(MASTER_CHEF_ADDRESS, valueInWei);
      await approveTx.wait();
      console.log("Approved");
      /**const allowance = await pairContract.allowance(
        signer.getAddress(),
        MASTER_CHEF_ADDRESS
      );
      console.log("Allowance:", allowance);**/
      const masterChef = new ethers.Contract(
        MASTER_CHEF_ADDRESS,
        MASTER_CHEF_ABI.abi,
        signer
      );
      // Get total number of pools
      const poolLength = await masterChef.poolLength();
      console.log("Pool Length:", poolLength);
      // Iterate through pools to find matching address
      let selectedPoolId = 0;
      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await masterChef.poolInfo(pid);
        if (poolInfo.lpToken.toLowerCase() === poolId.toLowerCase()) {
          selectedPoolId = pid;
          break;
        }
      }
      console.log("Selected Pool ID:", selectedPoolId);
      const tx = await masterChef.deposit(selectedPoolId, valueInWei);
      await tx.wait();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveStake = async (value: string, poolId: string) => {
    console.log("Remove Stake", value, poolId);
    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();
      const masterChef = new ethers.Contract(
        MASTER_CHEF_ADDRESS,
        MASTER_CHEF_ABI.abi,
        signer
      );
      // Get total number of pools
      const poolLength = await masterChef.poolLength();
      console.log("Pool Length:", poolLength);
      // Iterate through pools to find matching address
      let selectedPoolId = 0;
      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await masterChef.poolInfo(pid);
        if (poolInfo.lpToken.toLowerCase() === poolId.toLowerCase()) {
          selectedPoolId = pid;
          break;
        }
      }
      console.log("Selected Pool ID:", selectedPoolId);
      const valueInWei = ethers.utils.parseUnits(value.toString(), 18); // or use the specific token decimals
      const tx = await masterChef.withdraw(selectedPoolId, valueInWei);
      await tx.wait();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePendingRewards = async (poolId: string) => {
    console.log("Pending Rewards", poolId);
    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );
      const signer = provider.getSigner();
      const masterChef = new ethers.Contract(
        MASTER_CHEF_ADDRESS,
        MASTER_CHEF_ABI.abi,
        signer
      );
      const poolLength = await masterChef.poolLength();
      console.log("Pool Length:", poolLength);
      // Iterate through pools to find matching address
      let selectedPoolId = 0;
      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await masterChef.poolInfo(pid);
        if (poolInfo.lpToken.toLowerCase() === poolId.toLowerCase()) {
          selectedPoolId = pid;
          break;
        }
      }
      console.log("Selected Pool ID:", selectedPoolId);
      const pendingRewards = await masterChef.pendingSauce(
        selectedPoolId,
        signer.getAddress()
      );
      console.log("Pending Rewards:", pendingRewards);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Paper className={classes.root}>
        <TableContainer className={classes.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Pools</TableCell>
                <TableCell align="right">Liquidity</TableCell>
                <TableCell align="right">Token 1</TableCell>
                <TableCell align="right">Token 2</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allPools.map((pool) => (
                <TableRow key={pool.id} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1">
                      {pool.token0Symbol}/{pool.token1Symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{pool.apr}</TableCell>
                  <TableCell align="right">{pool.tvl}</TableCell>
                  <TableCell align="right">{pool.volume24h}</TableCell>
                  <TableCell align="right">
                    <CustomizedMenus
                      menuItems={[
                        {
                          label: "Remove Stake",
                          onClick: () => {
                            setSelectedPoolId(pool.id);
                            setOpenRemoveStakeDialog(true);
                          },
                        },
                        {
                          label: "Add Stake",
                          onClick: () => {
                            setOpenAddStakeDialog(true);
                            setSelectedPoolId(pool.id);
                          },
                        },
                        {
                          label: "Pending Rewards",
                          onClick: () => {
                            handlePendingRewards(pool.id);
                          },
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <AddStakeDialog
        open={openAddStakeDialog}
        onClose={() => setOpenAddStakeDialog(false)}
        onTransact={handleTransact}
        poolId={selectedPoolId}
      />
      <RemoveStakeDialog
        open={openRemoveStakeDialog}
        onClose={() => setOpenRemoveStakeDialog(false)}
        onTransact={handleRemoveStake}
        poolId={selectedPoolId}
      />
    </div>
  );
};

// Helper functions
const getTokenSymbol = async (
  tokenAddress: string,
  provider: ethers.providers.Provider
) => {
  const tokenABI = ["function symbol() view returns (string)"];
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
  return await tokenContract.symbol();
};

const formatNumber = (value: string): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(parseFloat(value));
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

// Add this constant at the top with other constants
const PRICE_FEED_API = "YOUR_PRICE_API_ENDPOINT"; // You'll need to use a price feed API

// Add this helper function with other helper functions
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

// Update the calculateAPR function
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

export default Staking;
