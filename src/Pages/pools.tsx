import React, { useEffect, useState, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
} from "@material-ui/core";
import { makeStyles, styled, useTheme } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import CustomizedMenus from "../Components/styledMenu";
import CoinPairIcons from "../Components/coinPairIcons";
import ConnectWalletButton from "../Components/connectWalletButton";
import { PoolsNoItems } from "../Components/poolsNoItems";
import AddLiquidity from "./addLiquidity";
import RemoveLiquidity from "./removeLiquidity";
import { fetchMyPools, fetchPools, fetchSinglePool, fetchSingleUserPool } from "../store/pool/poolThunks";
import { RootState, AppDispatch } from "../store/store";
import { useSelector, useDispatch } from "react-redux";

import { useNetwork } from "../Hooks/useNetwork";
import { useWallet } from "../Hooks/useWallet";
import { ethers } from "ethers";
import { setSelectedPool } from "../store/pool/poolSlice";
import { useProviderContext } from "../Contexts/providerContext";
import { POOL } from "../interfaces";
import { setToken1, setToken2 } from "../store/liquidity/liquiditySlice";
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

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
    borderRadius: "12px",
    padding: "1px",
  }
}));

const StyledDialogContainer = styled(Box)(({ theme }) => ({
  background: "radial-gradient(86.33% 299.52% at 13.67% 23.12%, #272727 0%, #0E0E0E 100%)",
  borderRadius: "12px",
}));

const StyledDialogHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: `${theme.palette.primary.main} !important`,
}));

const StyledPoolTabContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: 1, 
  borderColor: "divider",
  marginBottom: "16px"
}));

const StyledAPRText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
  backgroundClip: "text",
  color: "transparent !important",
}));

const StyledpoolsTableRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "32px",
  padding: "0 24px",
}));

const StyledpoolCardHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
}));

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

interface PoolsListProps {}

const PoolsList: React.FC<PoolsListProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rpcProvider, isConnected: isNetworkConnected } = useNetwork();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isConnected: isWalletConnected } = useWallet();
  const { pools, myPools, selectedPool, loading } = useSelector(
    (state: RootState) => state.pool
  );
  const [value, setValue] = useState(0);
  const [isAddLiquidityDialogOpen, setIsAddLiquidityDialogOpen] =
    useState(false);
  const [isRemoveLiquidityDialogOpen, setIsRemoveLiquidityDialogOpen] =
    useState(false);
  
  const { provider } = useProviderContext(); 

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  // Create a reusable fetch function
  const fetchPoolsData = useCallback(async () => {
    try {
      if (isNetworkConnected && provider) {
        const web3Provider = new ethers.providers.Web3Provider(provider);
        await dispatch(fetchMyPools(web3Provider)).unwrap();
      }
      if (rpcProvider) {
        await dispatch(fetchPools(rpcProvider)).unwrap();
      }
    } catch (error) {
      console.error('Error fetching pools data:', error);
    }
  }, [dispatch, isNetworkConnected, provider, rpcProvider]);

  // Initial data fetch
  useEffect(() => {
    fetchPoolsData();
  }, [fetchPoolsData, isWalletConnected]);

  useEffect(() => {
    if (selectedPool) {
      dispatch(setToken1(selectedPool.token0));
      dispatch(setToken2(selectedPool.token1));
    }
  }, [selectedPool]);

  // Replace polling-related state and functions with specific pool update function
  const updatePoolData = useCallback(async (poolId: string) => {
    try {
      if (!rpcProvider) return;

      // Fetch single pool data
      await dispatch(fetchSinglePool({ 
        rpcProvider, 
        poolId 
      })).unwrap();

      // If it's in myPools, update user's position too
      if (isWalletConnected && provider && myPools.some(p => p.id === poolId)) {
        const web3Provider = new ethers.providers.Web3Provider(provider);
        await dispatch(fetchSingleUserPool({
          provider: web3Provider,
          poolId
        })).unwrap();
      }
    } catch (error) {
      console.error('Error updating pool data:', error);
    }
  }, [dispatch, rpcProvider, provider, isWalletConnected, myPools]);

  // Update handlers to use polling
  const handleCloseAddLiquidityDialog = async () => {
    setIsAddLiquidityDialogOpen(false);
    const selectedPoolId = selectedPool?.id;
    if (selectedPoolId) {
      await updatePoolData(selectedPoolId);
    }
  };

  const handleCloseRemoveLiquidityDialog = async () => {
    setIsRemoveLiquidityDialogOpen(false);
    const selectedPoolId = selectedPool?.id;
    if (selectedPoolId) {
      await updatePoolData(selectedPoolId);
    }
  };

  const handleAddLiquidity = (pool?: POOL) => { 
    setIsAddLiquidityDialogOpen(true);
    if (pool) {
      dispatch(setSelectedPool(pool));
    }
  };

  const handleRemoveLiquidity = (pool?: POOL) => {
    setIsRemoveLiquidityDialogOpen(true);
    if (pool) {
      dispatch(setSelectedPool(pool));
    }
  };

  const renderAddLiquidityDialog = () => {
    return (
      <StyledDialog
        open={isAddLiquidityDialogOpen}
        onClose={handleCloseAddLiquidityDialog}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogContainer>
          <StyledDialogHeader>
            <StyledDialogTitle>
              Add Liquidity
            </StyledDialogTitle>
            <IconButton onClick={handleCloseAddLiquidityDialog}>
              <CloseIcon color="primary" fontSize="medium" /> 
            </IconButton>
          </StyledDialogHeader>
        <DialogContent>
            <AddLiquidity 
              onClose={async () => {
                await handleCloseAddLiquidityDialog();
              }}
            />
        </DialogContent>
        </StyledDialogContainer>
      </StyledDialog>
    );
  };

  const renderRemoveLiquidityDialog = () => {
    return (
      <StyledDialog
        open={isRemoveLiquidityDialogOpen}
        onClose={handleCloseRemoveLiquidityDialog}
        maxWidth="sm"
        fullWidth
      >
        <StyledDialogContainer>
          <StyledDialogHeader>  
            <StyledDialogTitle>
              Remove Liquidity
            </StyledDialogTitle>
            <IconButton onClick={handleCloseRemoveLiquidityDialog}>
              <CloseIcon color="primary" fontSize="medium" /> 
            </IconButton>
          </StyledDialogHeader>
        
        <DialogContent>
            <RemoveLiquidity onClose={() => {
              handleCloseRemoveLiquidityDialog();
            }}/>
        </DialogContent>
        </StyledDialogContainer>
      </StyledDialog>
    );
  };

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
        <StyledPoolTabContainer sx={{ flexDirection: isMobile ? "column" : "row" }}>
          <Tabs value={value} onChange={handleChange} className="pool-tabs">
            <Tab label="All Pools" {...a11yProps(0)} />
            <Tab label="My Pools" {...a11yProps(1)} />
          </Tabs>
          <Button
              variant="contained"
              color="primary"
              className={"gradient-button liquidity-add-button"}
              onClick={() => handleAddLiquidity()}
              style={{ marginTop: isMobile ? "16px" : "0px" }}
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  Add Position
                </Typography>
              </div>
            </Button>  
        </StyledPoolTabContainer>
        <CustomTabPanel value={value} index={0}>
          {isMobile &&
            (pools.length === 0  ? (
              <PoolsNoItems
                description="No Liquidity added yet"
                addLiquidityButtonOnClick={() => handleAddLiquidity()}
              />
            ) : (
              <Box>
                {pools.map((pool) => (
                  <Card key={pool.id} className="pool-card">
                    <CardContent className="pool-card__content">
                      {/* Pool Pair */}
                      <StyledpoolCardHeader>
                        <Box
                          sx={{ display: "flex", flexDirection: "row" }}
                          className="pool-card__pair"
                        >
                          <Box className="pool-card__icons">
                            <CoinPairIcons
                              coin1Image={pool.token0.icon}
                              coin2Image={pool.token1.icon}
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            className="pool-card__symbols gradient-text"
                          >
                            {pool.token0.symbol}/{pool.token1.symbol}
                          </Typography>
                        </Box>
                        {isWalletConnected && (
                          <Box className="pool-card__menu">
                            <CustomizedMenus menuItems={[
                              { label: "Add Liquidity", onClick: () => {
                                  //dispatch(setSelectedPool(pool));
                                  handleAddLiquidity(pool);
                                },
                              },
                            ]}
                          />
                          </Box>
                        )}
                      </StyledpoolCardHeader>

                      {/* Stats Grid */}
                      <Grid container spacing={2} className="pool-card__stats">
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            APR
                          </Typography>
                          <StyledAPRText className="pool-card__stat-value" variant="body2">
                            {pool.apr}%
                          </StyledAPRText>
                        </Grid>
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            TVL
                          </Typography>
                          <Typography className="pool-card__stat-value" variant="body2">
                            ${pool.tvl}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            Volume
                          </Typography>
                          <Typography className="pool-card__stat-value" variant="body2">
                            ${pool.volume24h}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            Token 1
                          </Typography>
                          <Typography className="pool-card__stat-value" variant="body2">
                            ${pool.token0Reserve}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} className="pool-card__stat">
                          <Typography className="pool-card__stat-label">
                            Token 2
                          </Typography>
                          <Typography className="pool-card__stat-value" variant="body2">
                            ${pool.token1Reserve}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ))}
          {!isMobile &&
            (pools.length === 0 ? (
              <PoolsNoItems
                description="No Liquidity added yet"
                addLiquidityButtonOnClick={() => handleAddLiquidity()}
              />
            ) : (
              <TableContainer className="pools-table">
                <Box className="pools-table__container">
                  <Box className="pools-table__header">
                    <StyledpoolsTableRow
                      className="pools-table__row"
                    >
                      <Box className="pools-table__cell" sx={{ flex: "3" }}>
                        Pools
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        APR
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}} 
                      >
                        TVL
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        Volume
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        Token 1
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        Token 2
                      </Box>
                      { isWalletConnected && (
                        <Box
                          className="pools-table__cell"
                          sx={{ flex: "0.5"}}
                        ></Box>
                      )}
                    </StyledpoolsTableRow>
                  </Box>

                  <Box className="pools-table__body">
                    {pools.map((pool: POOL) => (
                      <StyledpoolsTableRow
                        key={pool.id}
                        className="pools-table__row"
                      >
                        <Box className="pools-table__cell" sx={{ flex: "3" }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            className="pools-table__pair"
                          >
                            <CoinPairIcons
                              coin1Image={pool.token0.icon}
                              coin2Image={pool.token1.icon}
                            />
                            <Typography
                              variant="body2"
                              className="gradient-text pools-table__symbols"
                            >
                              {pool.token0.symbol}/{pool.token1.symbol}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--apr"
                          sx={{ flex: "1"}}
                        >
                          <StyledAPRText variant="body2">{pool.apr}%</StyledAPRText>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--tvl"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.tvl}</Typography>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--volume"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.volume24h}</Typography>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--apr"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.token0Reserve}</Typography>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--apr"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.token1Reserve}</Typography>
                        </Box>
                        {isWalletConnected && (
                          <Box
                            className="pools-table__cell pools-table__cell--menu"
                            sx={{ flex: "0.5"}}
                          >
                            <CustomizedMenus menuItems={[
                              { label: "Add Liquidity", onClick: () => {
                                  //dispatch(setSelectedPool(pool));
                                  handleAddLiquidity(pool);
                                },
                              },
                            ]} />
                          </Box>
                        )}
                      </StyledpoolsTableRow>
                    ))}
                  </Box>
                </Box>
              </TableContainer>
            ))}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          {isMobile && isWalletConnected && (
            <Box>
              {myPools.length === 0 ? (
                <PoolsNoItems
                  description="No Liquidity added yet"
                  addLiquidityButtonOnClick={() => handleAddLiquidity()}
                />
              ) : (
                <Box>
                  {myPools.map((pool: POOL) => (
                    <Card key={pool.id} className="pool-card">
                      <CardContent className="pool-card__content">
                        {/* Pool Pair */}
                        <StyledpoolCardHeader>
                          <Box
                            sx={{ display: "flex", flexDirection: "row" }}
                            className="pool-card__pair"
                          >
                            <Box className="pool-card__icons">
                              <CoinPairIcons
                                coin1Image={pool.token0.icon}
                                coin2Image={pool.token1.icon}
                              />
                            </Box>
                            <Typography
                              variant="h6"
                              className="pool-card__symbols gradient-text"
                            >
                              {pool.token0.symbol}/{pool.token1.symbol}
                            </Typography>
                          </Box>
                          <Box className="pool-card__menu">
                            <CustomizedMenus menuItems={[
                              { label: "Add Liquidity", onClick: () => {
                                  //dispatch(setSelectedPool(pool));
                                  handleAddLiquidity(pool);
                                },
                              },
                              { label: "Remove Liquidity", onClick: () => {
                                  //dispatch(setSelectedPool(pool));
                                  handleRemoveLiquidity(pool);
                                },
                              },
                            ]} />
                          </Box>
                        </StyledpoolCardHeader>

                        {/* Stats Grid */}
                        <Grid
                          container
                          spacing={2}
                          className="pool-card__stats"
                        >
                          <Grid item xs={4} className="pool-card__stat">
                            <Typography className="pool-card__stat-label">
                              APR
                            </Typography>
                            <StyledAPRText className="pool-card__stat-value" variant="body2">
                              {pool.apr}%
                            </StyledAPRText>
                          </Grid>
                          <Grid item xs={4} className="pool-card__stat">
                            <Typography className="pool-card__stat-label">
                              TVL
                            </Typography>
                            <Typography className="pool-card__stat-value" variant="body2">
                              ${pool.tvl}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} className="pool-card__stat">
                            <Typography className="pool-card__stat-label">
                              Volume
                            </Typography>
                            <Typography className="pool-card__stat-value" variant="body2">
                              ${pool.volume24h}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} className="pool-card__stat">
                            <Typography className="pool-card__stat-label">
                              Token 1
                            </Typography>
                            <Typography className="pool-card__stat-value" variant="body2">
                              ${pool.token0Share}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} className="pool-card__stat">
                            <Typography className="pool-card__stat-label">
                              Token 2
                            </Typography>
                            <Typography className="pool-card__stat-value" variant="body2">
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
          {!isMobile &&
            isWalletConnected &&
            (myPools.length === 0 ? (
              <PoolsNoItems
                description="No Liquidity added yet"
                addLiquidityButtonOnClick={() => handleAddLiquidity()}
              />
            ) : (
              <TableContainer className="pools-table">
                <Box className="pools-table__container">
                  <Box className="pools-table__header">
                    <StyledpoolsTableRow
                      className="pools-table__row"
                    >
                      <Box className="pools-table__cell" sx={{ flex: "3" }}>
                        Pools
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        APR
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        TVL
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        Volume
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        Token 1
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1"}}
                      >
                        Token 2
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "0.5"}}
                      ></Box>
                    </StyledpoolsTableRow>
                  </Box>

                  <Box className="pools-table__body">
                    {myPools.map((pool: POOL ) => (
                      <StyledpoolsTableRow
                        key={pool.id}
                        className="pools-table__row"
                      >
                        <Box className="pools-table__cell" sx={{ flex: "3" }}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            className="pools-table__pair"
                          >
                            <CoinPairIcons
                              coin1Image={pool.token0.icon}
                              coin2Image={pool.token1.icon}
                            />
                            <Typography
                              variant="body2"
                              className="gradient-text pools-table__symbols"
                            >
                              {pool.token0.symbol}/{pool.token1.symbol}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--volume"
                          sx={{ flex: "1"}}
                        >
                          <StyledAPRText variant="body2">{pool.apr}%</StyledAPRText>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--tvl"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.tvl}</Typography>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--apr"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.volume24h}</Typography>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--tvl"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.token0Share}</Typography>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--volume"
                          sx={{ flex: "1"}}
                        >
                          <Typography variant="body2">${pool.token1Share}</Typography>
                        </Box>
                        {isWalletConnected && (
                          <Box
                            className="pools-table__cell pools-table__cell--menu"
                            sx={{ flex: "0.5"}}
                          >
                            <CustomizedMenus menuItems={[
                              { label: "Add Liquidity", onClick: () => {
                                  //dispatch(setSelectedPool(pool));
                                  handleAddLiquidity(pool);
                                },
                              },
                              { label: "Remove Liquidity", onClick: () => {
                                  //dispatch(setSelectedPool(pool));
                                  handleRemoveLiquidity(pool);
                                },
                              },
                            ]} />
                          </Box>
                        )}
                      </StyledpoolsTableRow>
                    ))}
                  </Box>
                </Box>
              </TableContainer>
            ))}
          {!isWalletConnected && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              height="100%"
              flexDirection={isMobile ? "column" : "row"}
              className="pools-table__empty"
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
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
      {renderAddLiquidityDialog()}
      {renderRemoveLiquidityDialog()}
    </Box>
  );
};

export default PoolsList;
