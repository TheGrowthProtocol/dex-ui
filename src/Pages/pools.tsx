import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Typography,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CustomizedMenus from "../Components/styledMenu";
import { MenuItemProps } from "../interfaces";
import CoinPairIcons from "../Components/coinPairIcons";
import { useWallet } from "../Hooks/useWallet";
import ConnectWalletButton from "../Components/connectWalletButton";
import { PoolsNoItems } from "../Components/poolsNoItems";
import { fetchMyPools, fetchPools } from "../store/pool/poolThunks";
import { RootState, AppDispatch } from "../store/store";
import { useSelector , useDispatch} from "react-redux";
  

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
      {value === index && children}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    className: "pool-tab-button",
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};



interface PoolsListProps {
  handleTabChange: (newValue: number) => void;
}

const PoolsList: React.FC<PoolsListProps> = ({handleTabChange}) => {
  const dispatch = useDispatch<AppDispatch>();  
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isConnected: isWalletConnected } = useWallet();
  const { pools, loading , myPools} = useSelector((state: RootState) => state.pool);
  const [value, setValue] = useState(0);


  const myPoolsMenuItems: MenuItemProps[] = [
    { label: "Remove Liquidity", onClick: () => handleTabChange(3) },
    { label: "Add Liquidity", onClick: () => handleTabChange(1)},
  ];

  const allPoolsMenuItems: MenuItemProps[] = [
    { label: "Add Liquidity", onClick: () => handleTabChange(1)},
  ];

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (isWalletConnected) {  
      dispatch(fetchMyPools());
    }
    dispatch(fetchPools());
  }, [isWalletConnected, dispatch]);

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={`${classes.root} tabpanel-container`}>
      <Box className="tabpanel-content">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleChange} className="pool-tabs">
            <Tab label="All Pools" {...a11yProps(0)} />
            <Tab label="My Pools" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {isMobile && (
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
                      {
                      isWalletConnected && (
                        <Box className="pool-card__menu">
                          <CustomizedMenus menuItems={allPoolsMenuItems} />
                        </Box>
                      )
                    }
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
          )}
          {!isMobile && (
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
                      {
                      isWalletConnected && (
                        <Box className='pools-table__cell pools-table__cell--menu' sx={{ flex: '0.5', textAlign: 'right' }}>
                          <CustomizedMenus menuItems={allPoolsMenuItems} />
                        </Box>
                      )
                    }
                    </Box>
                  ))}
                </Box>
              </Box>
            </TableContainer>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
        {isMobile && isWalletConnected && (
          <Box>
            {myPools.length === 0 ? (
              <PoolsNoItems description="No Liquidity added yet" />
            ) : (
              <Box>
                {myPools.map((pool) => (
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
                          <CustomizedMenus menuItems={myPoolsMenuItems} />
                        </Box>
                      </Box>

                      {/* Stats Grid */}
                      <Grid container spacing={2} className="pool-card__stats">
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            Liquidity
                          </Typography>
                          <Typography className="pool-card__stat-value">
                          ${formatNumber(pool.liquidity?? '')}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            Token 1
                          </Typography>
                          <Typography className="pool-card__stat-value">
                            ${pool.token0Share}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            Token 2
                          </Typography>
                          <Typography className="pool-card__stat-value">
                            ${pool.token1Share}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
        {!isMobile && isWalletConnected && (
          myPools.length === 0 ? (
            <PoolsNoItems description="No Liquidity added yet" />
          ) : (
            <TableContainer className='pools-table'>
            <Box className='pools-table__container'>
              <Box className='pools-table__header'>
                <Box className='pools-table__row' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box className='pools-table__cell' sx={{ flex: '2' }}>Pools</Box>
                  <Box className='pools-table__cell' sx={{ flex: '1', textAlign: 'right' }}>Liquidity</Box>
                  <Box className='pools-table__cell' sx={{ flex: '1', textAlign: 'right' }}>Token 1</Box>
                  <Box className='pools-table__cell' sx={{ flex: '1', textAlign: 'right' }}>Token 2</Box>
                  <Box className='pools-table__cell' sx={{ flex: '0.5', textAlign: 'right' }}></Box>
                </Box>
              </Box>

              <Box className='pools-table__body'>
                {myPools.map((pool) => (
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
                    <Box className='pools-table__cell pools-table__cell--apr' sx={{ flex: '1', textAlign: 'right' }}>${formatNumber(pool.liquidity?? '')}</Box>
                    <Box className='pools-table__cell pools-table__cell--tvl' sx={{ flex: '1', textAlign: 'right' }}>{pool.token0Share}</Box>
                    <Box className='pools-table__cell pools-table__cell--volume' sx={{ flex: '1', textAlign: 'right' }}>{pool.token1Share}</Box>
                    {
                      isWalletConnected && (
                        <Box className='pools-table__cell pools-table__cell--menu' sx={{ flex: '0.5', textAlign: 'right' }}>
                          <CustomizedMenus menuItems={myPoolsMenuItems} />
                        </Box>
                      )
                    }
                    </Box>
                  ))}
                </Box>
              </Box>
          </TableContainer>
          ))}
          {!isWalletConnected && (
            <Box display="flex" justifyContent="space-between" alignItems="center" height="100%" flexDirection={isMobile ? "column" : "row"} className="pools-table__empty">
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}> 
                <CoinPairIcons />
                <Typography variant="body1">
                Connect wallet to see your pools
                </Typography>
              </Box>
              <ConnectWalletButton />
            </Box>
          )}
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

// Helper functions
const formatNumber = (value: string): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(parseFloat(value));
};

export default PoolsList;
