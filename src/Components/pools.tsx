import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  Tabs,
  Tab,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ethers } from "ethers";
import { formatEther } from "@ethersproject/units";
import POOL_FACTORY_ABI from "../build/IUniswapV2Factory.json";
import PAIR_ABI from "../build/IUniswapV2Pair.json";
import CustomizedMenus from "./styledMenu";
import { MenuItemProps } from "../interfaces";
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}



const menuItems: MenuItemProps[] = [
  { label: "Remove Liquidity", onClick: () => {} },
  { label: "Add Liquidity", onClick: () => {} },
];

const PoolsList: React.FC = () => {
  const classes = useStyles();
  const [myPools, setMyPools] = useState<Pool[]>([]);
  const [allPools, setAllPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const fetchMyPools = async () => {
    try {
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
      const account = await provider.getSigner().getAddress();

      // Get all pools
      const poolCount = await factory.allPairsLength();
      const poolsData = await Promise.all(
        Array.from({ length: Number(poolCount) }, async (_, i) => {
          // Get pair address
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

          return {
            id: pairAddress,
            token0Address,
            token1Address,
            token0Symbol,
            token1Symbol,
            token0Share: formatEther(token0Share),
            token1Share: formatEther(token1Share),
            liquidity: formatEther(liquidity),
          };
        })
      );

      setMyPools(poolsData);
    } catch (error) {
      console.error("Error fetching pools:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPools = async () => {
    try {
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
            const tvl = parseFloat(formatEther(reserve0)) * price0 + 
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
        console.error("Error fetching pools:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchMyPools();
    fetchAllPools();
  }, []);

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper className={classes.root}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="All Pools" {...a11yProps(0)} />
          <Tab label="My Pools" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
      <TableContainer className={classes.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Pools</TableCell>
                <TableCell align="right">APR</TableCell>
                <TableCell align="right">TVL</TableCell>
                <TableCell align="right">Volume</TableCell>
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
                  <TableCell align="right">
                    { pool.apr}
                  </TableCell>
                  <TableCell align="right">{pool.tvl}</TableCell>
                  <TableCell align="right">{pool.volume24h}</TableCell>
                  <TableCell align="right">
                    <CustomizedMenus menuItems={menuItems}/>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <TableContainer className={classes.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Pool</TableCell>
                <TableCell align="right">Liquidity</TableCell>
                <TableCell align="right">Token 1</TableCell>
                <TableCell align="right">Token 2</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myPools.map((pool) => (
                <TableRow key={pool.id} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1">
                      {pool.token0Symbol}/{pool.token1Symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ${formatNumber(pool.liquidity)}
                  </TableCell>
                  <TableCell align="right">{pool.token0Share}</TableCell>
                  <TableCell align="right">{pool.token1Share}</TableCell>
                  <TableCell align="right">
                    <CustomizedMenus menuItems={menuItems}/>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>
    </Paper>
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

export default PoolsList;
