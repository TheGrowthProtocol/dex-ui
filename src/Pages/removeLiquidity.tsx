import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, Slider, Select, MenuItem, useMediaQuery, useTheme } from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useWallet } from "../Hooks/useWallet";
import ConnectWalletButton from "../Components/connectWalletButton";
import { Tokenomics } from "../Components/tokenomics";
import LpTokenBalanceField from "../Components/lpTokenBalanceField";
import LpReceiveInputTokenField from "../Components/lpReceiveInputTokenField";
import CoinPairIcons from "../Components/coinPairIcons";
import { POOL } from "../interfaces";
import { fetchMyPools, fetchShareBalances, removeLpToken, selectPool } from "../store/pool/poolThunks";

const RemoveLiquidity: React.FC<{}> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme(); 
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { tokens } = useSelector((state: RootState) => state.tokens);
  const { myPools, selectedPool, removeLpToken0Share, removeLpToken1Share, error } = useSelector((state: RootState) => state.pool);
  const { isConnected: isWalletConnected } = useWallet();
  const [ percentage, setPercentage ] = useState<number>(50);
  const [ removeLpBalance, setRemoveLpBalance ] = useState<string>("--");
  const [token0, setToken0] = useState<string>("");
  const [token1, setToken1] = useState<string>("");

  // Add state for selected pool ID
  const [selectedPoolId, setSelectedPoolId] = useState<string>("0");

  useEffect(() => {
    if (isWalletConnected) {
      dispatch(fetchMyPools());  
    }
  }, [dispatch, isWalletConnected]);

  useEffect(() => {
    if (myPools.length > 0) {
      dispatch(selectPool(myPools[0].id));
    }
  }, [myPools]);

  useEffect(() => {
    if (selectedPoolId === "") {
      dispatch(selectPool(""));
    } else {
      dispatch(selectPool(selectedPoolId));
    }
  }, [dispatch, selectedPoolId]);

  useEffect(() => {
    if (selectedPool) {
        let removeLpBalance = Number(selectedPool.lpBalance?? 0) * percentage / 100;
        setRemoveLpBalance(removeLpBalance.toFixed(2));
      dispatch(fetchShareBalances({ pool: selectedPool, lpBalance: removeLpBalance }));
    }
  }, [percentage, selectedPool]);

  const handleSelectPool = (poolId: string) => {
    setSelectedPoolId(poolId); // Update local state
  }

  const handleRemoveLiquidityPool = () => {
    dispatch(removeLpToken());
  }

  return (
    <Grid container>
      <Grid item xs={12} md={12} lg={ isWalletConnected ? 6 : 12}>
        <Box className="tabpanel-container" sx={{ p: 3 }}>
          <Box className="tabpanel-content">
            {
                !isWalletConnected && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" height="100%" flexDirection={isMobile ? "column" : "row"} className="pools-table__empty">
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}> 
                            <CoinPairIcons />
                            <Typography variant="body1">
                            Connect wallet to remove
                            </Typography>
                        </Box>
                        <ConnectWalletButton />
                    </Box>
                )
            }
            { isWalletConnected && (
                <>
                <Box
                    display="flex"
              flexDirection="column"
              className="coin-field-container coin-field-pair-block"
            >
              <Typography variant="subtitle2">Select Liquidity Pool to remove Liquidity</Typography>
              <Box display="flex" className="coin-field-pair-container">
                <Select
                    color="primary"
                    className="select-pool-dropdown"
                    id="demo-simple-select-standard"
                    value={selectedPoolId} // Use local state instead
                    defaultValue={selectedPoolId}
                    onChange={(event) => handleSelectPool(event.target.value as string)}
                    fullWidth
                    label="Select Pool"
                >
                    {myPools.map((pool: POOL) => (
                        <MenuItem key={pool.id} value={pool.id}>
                            <Box display="flex" flexDirection="row">
                                <CoinPairIcons />
                                <Typography className={"gradient-text token-symbol"}>
                                    {pool.token0.symbol} / {pool.token1.symbol}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" className="remove-liquidity-container">
                <Box display="flex" flexDirection="row" className="remove-liquidity-container-header">
                    <Typography variant="subtitle2">Select Amount of Token Pair</Typography>
                </Box>
              {/* TODO: percentage block */}
              <Box display="flex" flexDirection="column" className="percentage-block">
                <Typography variant="h3" className="percentage-block-title gradient-text">{percentage}%</Typography>
                <Slider value={percentage} onChange={(event, newValue) => {setPercentage(newValue as number)}} className="percentage-block-slider"/>
                <Box display="flex" flexDirection="row" className="percentage-block-buttons" justifyContent={"space-between"} alignItems={"center"}>
                    <Button variant="contained" color="primary" className="percentage-block-button" onClick={() => setPercentage(25)}>25%</Button>
                    <Button variant="contained" color="primary" className="percentage-block-button" onClick={() => setPercentage(50)}>50%</Button>
                    <Button variant="contained" color="primary" className="percentage-block-button" onClick={() => setPercentage(75)}>75%</Button>
                    <Button variant="contained" color="primary" className="percentage-block-button" onClick={() => setPercentage(100)}>100%</Button>
                </Box>
                <Grid container>
                    <Grid item xs={12} md={12} lg={6}>
                        <LpTokenBalanceField title="Wallet LP tokens" balance={selectedPool?.lpBalance || "--"} usdValue="(--USD)" />
                    </Grid>
                    <Grid item xs={12} md={12} lg={6}>
                        <LpTokenBalanceField title="Selected LP Tokens for removal" balance={removeLpBalance} usdValue="(--USD)" />
                    </Grid>
                </Grid>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" className="pooled-tokens-receiving-container">
              <Typography variant="subtitle2">Pooled Tokens receiving</Typography>
              {/* TODO: Pooled Tokens receiving */}
              {
                removeLpToken0Share && removeLpToken1Share && (
                    <Box display="flex" flexDirection="row" className="pooled-tokens-receiving-input">
                    <LpReceiveInputTokenField token={removeLpToken0Share.token} balance={removeLpToken0Share.amount} usdValue={removeLpToken0Share.amount} />
                    <Box>
                        <Typography variant="subtitle2">+</Typography>
                    </Box>
                    <LpReceiveInputTokenField token={removeLpToken1Share.token} balance={removeLpToken1Share.amount} usdValue={removeLpToken1Share.amount} />
                </Box>
              )
              }
            </Box>
            </> 
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="liquidity-button-container"
        >
          {isWalletConnected && (
            <Button
              variant="contained"
              color="primary"
              className={"gradient-button liquidity-add-button"}
              onClick={handleRemoveLiquidityPool}
              //disabled={!token1.address || !token2.address}
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  {"Remove Liquidity"}
                </Typography>
              </div>
            </Button>
          )}
        </Box>
      </Grid>
      { isWalletConnected && (
      <Grid item xs={12} md={12} lg={6}>
        <Tokenomics 
        isConnected={isWalletConnected}                 
        type="pool"
        selectedPool={selectedPool}
        />
      </Grid>
      )}
    </Grid>
  );
};

export default RemoveLiquidity;