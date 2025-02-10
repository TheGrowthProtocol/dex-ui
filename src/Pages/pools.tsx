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
import { fetchMyPools, fetchPools } from "../store/pool/poolThunks";
import { RootState, AppDispatch } from "../store/store";
import { useSelector, useDispatch } from "react-redux";

import { useNetwork } from "../Hooks/useNetwork";
import { useWallet } from "../Hooks/useWallet";
import { ethers } from "ethers";
import { setSelectedPool } from "../store/pool/poolSlice";
import { useProviderContext } from "../Contexts/providerContext";

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
  const { pools, loading, myPools } = useSelector(
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

  const handleCloseAddLiquidityDialog = async() => {
    setIsAddLiquidityDialogOpen(false);
    try {
      //refresh pools data when dialog closes
      if (isNetworkConnected && provider) {
        const web3Provider = new ethers.providers.Web3Provider(provider);
        setTimeout(async () => {
          await dispatch(fetchMyPools(web3Provider)).unwrap();
        }, 1000);
      }
      setTimeout(async () => {
        await dispatch(fetchPools(rpcProvider)).unwrap();
      }, 1000);
    } catch (error) {
      console.error('Error updating pools after adding liquidity:', error);
    }
  };

  const handleCloseRemoveLiquidityDialog = () => {
    setIsRemoveLiquidityDialogOpen(false);
    //refresh pools data when dialog closes
    if (isNetworkConnected && provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      setTimeout(() => {
        dispatch(fetchMyPools(web3Provider)).unwrap();
      }, 1000);
    }
    setTimeout(() => {
      dispatch(fetchPools(rpcProvider)).unwrap();
    }, 1000);
  };

  const handleAddLiquidity = () => {
    setIsAddLiquidityDialogOpen(true);
  };

  const handleRemoveLiquidity = () => {
    setIsRemoveLiquidityDialogOpen(true);
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
            <AddLiquidity onClose={async () => {
              await handleCloseAddLiquidityDialog();
            }}/>
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

  useEffect(() => {
    if (isNetworkConnected && provider) {
      const web3Provider = new ethers.providers.Web3Provider(provider);
      dispatch(fetchMyPools(web3Provider)).unwrap();
    }
    dispatch(fetchPools(rpcProvider));
  }, [isWalletConnected, dispatch, isNetworkConnected, rpcProvider]);

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
        <StyledPoolTabContainer>
          <Tabs value={value} onChange={handleChange} className="pool-tabs">
            <Tab label="All Pools" {...a11yProps(0)} />
            <Tab label="My Pools" {...a11yProps(1)} />
          </Tabs>
          <Button
              variant="contained"
              color="primary"
              className={"gradient-button liquidity-add-button"}
              onClick={handleAddLiquidity}
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
            (pools.length === 0 ? (
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
                                  dispatch(setSelectedPool(pool));
                                  handleAddLiquidity();
                                },
                              },
                            ]}
                          />
                          </Box>
                        )}
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
                    <Box
                      className="pools-table__row"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box className="pools-table__cell" sx={{ flex: "2" }}>
                        Pools
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1", textAlign: "right" }}
                      >
                        APR
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1", textAlign: "right" }}
                      >
                        TVL
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1", textAlign: "right" }}
                      >
                        Volume
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "0.5", textAlign: "right" }}
                      ></Box>
                    </Box>
                  </Box>

                  <Box className="pools-table__body">
                    {pools.map((pool) => (
                      <Box
                        key={pool.id}
                        className="pools-table__row"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box className="pools-table__cell" sx={{ flex: "2" }}>
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
                              variant="body1"
                              className="gradient-text pools-table__symbols"
                            >
                              {pool.token0.symbol}/{pool.token1.symbol}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--apr"
                          sx={{ flex: "1", textAlign: "right" }}
                        >
                          {pool.apr}
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--tvl"
                          sx={{ flex: "1", textAlign: "right" }}
                        >
                          {pool.tvl}
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--volume"
                          sx={{ flex: "1", textAlign: "right" }}
                        >
                          {pool.volume24h}
                        </Box>
                        {isWalletConnected && (
                          <Box
                            className="pools-table__cell pools-table__cell--menu"
                            sx={{ flex: "0.5", textAlign: "right" }}
                          >
                            <CustomizedMenus menuItems={[
                              { label: "Add Liquidity", onClick: () => {
                                  dispatch(setSelectedPool(pool));
                                  handleAddLiquidity();
                                },
                              },
                            ]} />
                          </Box>
                        )}
                      </Box>
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
                                  dispatch(setSelectedPool(pool));
                                  handleAddLiquidity();
                                },
                              },
                              { label: "Remove Liquidity", onClick: () => {
                                  dispatch(setSelectedPool(pool));
                                  handleRemoveLiquidity();
                                },
                              },
                            ]} />
                          </Box>
                        </Box>

                        {/* Stats Grid */}
                        <Grid
                          container
                          spacing={2}
                          className="pool-card__stats"
                        >
                          <Grid item xs={4} className="pool-card__stat">
                            <Typography className="pool-card__stat-label">
                              Liquidity
                            </Typography>
                            <Typography className="pool-card__stat-value">
                              ${formatNumber(pool.liquidity ?? "")}
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
                    <Box
                      className="pools-table__row"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box className="pools-table__cell" sx={{ flex: "2" }}>
                        Pools
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1", textAlign: "right" }}
                      >
                        Liquidity
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1", textAlign: "right" }}
                      >
                        Token 1
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "1", textAlign: "right" }}
                      >
                        Token 2
                      </Box>
                      <Box
                        className="pools-table__cell"
                        sx={{ flex: "0.5", textAlign: "right" }}
                      ></Box>
                    </Box>
                  </Box>

                  <Box className="pools-table__body">
                    {myPools.map((pool) => (
                      <Box
                        key={pool.id}
                        className="pools-table__row"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box className="pools-table__cell" sx={{ flex: "2" }}>
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
                              variant="body1"
                              className="gradient-text pools-table__symbols"
                            >
                              {pool.token0.symbol}/{pool.token1.symbol}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--apr"
                          sx={{ flex: "1", textAlign: "right" }}
                        >
                          ${formatNumber(pool.liquidity ?? "")}
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--tvl"
                          sx={{ flex: "1", textAlign: "right" }}
                        >
                          {pool.token0Share}
                        </Box>
                        <Box
                          className="pools-table__cell pools-table__cell--volume"
                          sx={{ flex: "1", textAlign: "right" }}
                        >
                          {pool.token1Share}
                        </Box>
                        {isWalletConnected && (
                          <Box
                            className="pools-table__cell pools-table__cell--menu"
                            sx={{ flex: "0.5", textAlign: "right" }}
                          >
                            <CustomizedMenus menuItems={[
                              { label: "Add Liquidity", onClick: () => {
                                  dispatch(setSelectedPool(pool));
                                  handleAddLiquidity();
                                },
                              },
                              { label: "Remove Liquidity", onClick: () => {
                                  dispatch(setSelectedPool(pool));
                                  handleRemoveLiquidity();
                                },
                              },
                            ]} />
                          </Box>
                        )}
                      </Box>
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

// Helper functions
const formatNumber = (value: string): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(parseFloat(value));
};

export default PoolsList;
