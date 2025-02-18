import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  TableContainer,
  useMediaQuery,
  CardContent,
  Grid,
  Card,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CustomizedMenus from "../Components/styledMenu";
import { ethers } from "ethers";
import MASTER_CHEF_ABI from "../build/MasterChef.json";
import PAIR_ABI from "../build/IUniswapV2Pair.json";
import AddStakeDialog from "../Components/addStackDialog";
import RemoveStakeDialog from "../Components/removeStackDialog";
import CoinPairIcons from "../Components/coinPairIcons";
import { env } from "../env";
import { fetchPools } from "../store/pool/poolThunks";
import { useDispatch, useSelector } from "react-redux";
import { useNetwork } from "../Hooks/useNetwork";
import { AppDispatch, RootState } from "../store/store";
import { useWallet } from "../Hooks/useWallet";
import { PoolsNoItems } from "../Components/poolsNoItems";

const MASTER_CHEF_ADDRESS = env.contracts.masterChef;

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
  //const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const {rpcProvider} = useNetwork();
  const {pools, loading} = useSelector((state: RootState) => state.pool);
  const { isConnected: isWalletConnected } = useWallet();
  //const [allPools, setAllPools] = useState<Pool[]>([]);
  const [openAddStakeDialog, setOpenAddStakeDialog] = useState(false);
  const [openRemoveStakeDialog, setOpenRemoveStakeDialog] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const theme = useTheme(); 
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  useEffect(() => {
    dispatch(fetchPools(rpcProvider));
  }, [dispatch, rpcProvider]); 


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
      const masterChef = new ethers.Contract(
        MASTER_CHEF_ADDRESS,
        MASTER_CHEF_ABI.abi,
        signer
      );
      // Get total number of pools
      const poolLength = await masterChef.poolLength();
      // Iterate through pools to find matching address
      let selectedPoolId = 0;
      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await masterChef.poolInfo(pid);
        if (poolInfo.lpToken.toLowerCase() === poolId.toLowerCase()) {
          selectedPoolId = pid;
          break;
        }
      }
      const tx = await masterChef.deposit(selectedPoolId, valueInWei);
      await tx.wait();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveStake = async (value: string, poolId: string) => {
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
      // Iterate through pools to find matching address
      let selectedPoolId = 0;
      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await masterChef.poolInfo(pid);
        if (poolInfo.lpToken.toLowerCase() === poolId.toLowerCase()) {
          selectedPoolId = pid;
          break;
        }
      }
      const valueInWei = ethers.utils.parseUnits(value.toString(), 18); // or use the specific token decimals
      const tx = await masterChef.withdraw(selectedPoolId, valueInWei);
      await tx.wait();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePendingRewards = async (poolId: string) => {
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
      // Iterate through pools to find matching address
      let selectedPoolId = 0;
      for (let pid = 0; pid < poolLength; pid++) {
        const poolInfo = await masterChef.poolInfo(pid);
        if (poolInfo.lpToken.toLowerCase() === poolId.toLowerCase()) {
          selectedPoolId = pid;
          break;
        }
      }
      const pendingRewards = await masterChef.pendingSauce(
        selectedPoolId,
        signer.getAddress()
      );
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
    <Box className={`${classes.root} tabpanel-container`}>
      <Box className="tabpanel-content">
        {isMobile && (
          pools.length === 0 ? (
            <PoolsNoItems description="No Liquidity added yet" />
          ) : (
          <Box>
          {pools.map((pool) => (
            <Card key={pool.id} className="pool-card">
              <CardContent className="pool-card__content">
                {/* Pool Pair */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                  className="pool-card__header"
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "row" }}
                    className="pool-card__pair"
                  >
                    <Box className="pool-card__icons">
                      <CoinPairIcons coin1Image={pool.token0.icon} coin2Image={pool.token1.icon} />
                    </Box>
                    <Typography variant="h6" className="pool-card__symbols gradient-text">
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </Typography>
                  </Box>
                  <Box className="pool-card__menu">
                    {isWalletConnected && <CustomizedMenus menuItems={[
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
                      ]} />}
                  </Box>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={2} className="pool-card__stats">
                  <Grid item xs={4} className="pool-card__stat">
                    <Typography className="pool-card__stat-label">
                      APR
                    </Typography>
                    <Typography className="pool-card__stat-value">
                      {pool.apr}%
                    </Typography>
                  </Grid>
                  <Grid item xs={4} className="pool-card__stat">
                    <Typography className="pool-card__stat-label">
                    TVL
                    </Typography>
                    <Typography className="pool-card__stat-value">
                      ${pool.tvl}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} className="pool-card__stat">
                    <Typography className="pool-card__stat-label">
                      Volume 24h
                    </Typography>
                    <Typography className="pool-card__stat-value">
                      ${pool.volume24h}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
          )
        )}
        {!isMobile && (
          pools.length === 0 ? (
            <PoolsNoItems description="No Liquidity added yet" />
          ) : (
        <TableContainer className='pools-table'>
        <Box className='pools-table__container'>
          <Box className='pools-table__header'>
            <Box className='pools-table__row' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box className='pools-table__cell' sx={{ flex: '2' }}>Pools</Box>
              <Box className='pools-table__cell' sx={{ flex: '1', textAlign: 'right' }}>APR</Box>
              <Box className='pools-table__cell' sx={{ flex: '1', textAlign: 'right' }}>TVL</Box>
              <Box className='pools-table__cell' sx={{ flex: '1', textAlign: 'right' }}>Volume</Box>
              <Box className='pools-table__cell' sx={{ flex: '0.5', textAlign: 'right' }}></Box>
            </Box>
          </Box>

          <Box className='pools-table__body'>
            {pools.map((pool) => (
              <Box key={pool.id} className='pools-table__row' sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                
              }}>
                <Box className='pools-table__cell' sx={{ flex: '2' }}>
                  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }} className='pools-table__pair'>
                    <CoinPairIcons coin1Image={pool.token0.icon} coin2Image={pool.token1.icon} />
                    <Typography variant="body1" className="gradient-text pools-table__symbols">
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </Typography>
                  </Box>
                </Box>
                <Box className='pools-table__cell pools-table__cell--apr' sx={{ flex: '1', textAlign: 'right' }}>{pool.apr}</Box>
                <Box className='pools-table__cell pools-table__cell--tvl' sx={{ flex: '1', textAlign: 'right' }}>{pool.tvl}</Box>
                <Box className='pools-table__cell pools-table__cell--volume' sx={{ flex: '1', textAlign: 'right' }}>{pool.volume24h}</Box>
                <Box className='pools-table__cell pools-table__cell--menu' sx={{ flex: '0.5', textAlign: 'right' }}>
                  {isWalletConnected && <CustomizedMenus menuItems={[
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
                      ]} />}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </TableContainer>
          )
        )}
      </Box>
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
    </Box>
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
