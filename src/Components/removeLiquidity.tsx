import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, Slider, Select, MenuItem } from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { TOKEN } from "../interfaces";
import Coindialog from "./coindialog";
import TokenInputField from "./TokenInputField";
import { addLiquidity } from "../store/liquidity/liquidityThunks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  setToken1,
  setToken2,
  setAmount1,
  setAmount2,
} from "../store/liquidity/liquiditySlice";
import CoinNoIcon from "./coinNoIcon";
import { useWallet } from "../Hooks/useWallet";
import ConnectWalletButton from "./connectWalletButton";
import { Tokenomics } from "./tokenomics";
import LpTokenBalanceField from "./lpTokenBalanceField";
import LpReceiveInputTokenField from "./lpReceiveInputTokenField";

const RemoveLiquidity: React.FC<{}> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tokens } = useSelector((state: RootState) => state.tokens);
  const { isConnected: isWalletConnected } = useWallet();



  return (
    <Grid container>
      <Grid item xs={12} md={12} lg={6}>
        <Box className="tabpanel-container" sx={{ p: 3 }}>
          <Box className="tabpanel-content">
            <Box
              display="flex"
              flexDirection="column"
              className="coin-field-container coin-field-pair-block"
            >
              <Typography variant="subtitle2">Select Liquidity Pool to remove Liquidity</Typography>
              <Box display="flex" className="coin-field-pair-container">
                {/* TODO: select pool drop down */}
                <Select
                    className="select-pool-dropdown"
                    id="demo-simple-select-autowidth"
                    value={10}
                    onChange={(event, newValue) => {}}
                    autoWidth
                    label="Age"
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={21}>Twenty one</MenuItem>
                    <MenuItem value={22}>Twenty one and a half</MenuItem>
                </Select>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" className="remove-liquidity-container">
                <Box display="flex" flexDirection="row" className="remove-liquidity-container-header">
                    <Typography variant="subtitle2">Select Amount of Token Pair</Typography>
                </Box>
              {/* TODO: percentage block */}
              <Box display="flex" flexDirection="column" className="percentage-block">
                <Typography variant="h3" className="percentage-block-title gradient-text">50%</Typography>
                <Slider value={50} onChange={(event, newValue) => {}} className="percentage-block-slider"/>
                <Box display="flex" flexDirection="row" className="percentage-block-buttons" justifyContent={"space-between"} alignItems={"center"}>
                    <Button variant="contained" color="primary" className="percentage-block-button">25%</Button>
                    <Button variant="contained" color="primary" className="percentage-block-button">50%</Button>
                    <Button variant="contained" color="primary" className="percentage-block-button">75%</Button>
                    <Button variant="contained" color="primary" className="percentage-block-button">100%</Button>
                </Box>
                <Grid container>
                    <Grid item xs={12} md={12} lg={6}>
                        <LpTokenBalanceField title="Wallet LP tokens" balance="Balance" usdValue="(--USD)" />
                    </Grid>
                    <Grid item xs={12} md={12} lg={6}>
                        <LpTokenBalanceField title="Selected LP Tokens for removal" balance="Balance" usdValue="(--USD)" />
                    </Grid>
                </Grid>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" className="pooled-tokens-receiving-container">
              <Typography variant="subtitle2">Pooled Tokens receiving</Typography>
              {/* TODO: Pooled Tokens receiving */}
              <Box display="flex" flexDirection="row" className="pooled-tokens-receiving-input">
                <LpReceiveInputTokenField token={tokens[0]} balance="Balance" usdValue="(--USD)" />
                <Box>
                    <Typography variant="subtitle2">+</Typography>
                </Box>
                <LpReceiveInputTokenField token={tokens[1]} balance="Balance" usdValue="(--USD)" />
              </Box>
            </Box>
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
              //onClick={handleRemoveLiquidityPool}
              //disabled={!token1.address || !token2.address}
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  {"Remove Liquidity"}
                </Typography>
              </div>
            </Button>
          )}
          {!isWalletConnected && <ConnectWalletButton />}
        </Box>
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <Tokenomics items={[
          {
            title: "LP Reward APR (Annual % Rate)",
            value: "100,000,000"
          },
          {
            title: "Your share in Pool",
            value: "100,000,000"
          },
          {
            title: "LP Reward Share in Trading pair",
            value: "100,000,000"
          },
          {
            title: "Current BNB : CAKE Ratio in the pool",
            value: "100,000,000"
          },
          {
            title: "Current BNB-CAKE V2 LP Rate",
            value: "100,000,000"
          },
          {
            title: "CAKE per BNB",
            value: "100,000,000"
          },
          {
            title: "BNB per CAKE",
            value: "100,000,000"
          }
        ]}/>
      </Grid>
    </Grid>
  );
};

export default RemoveLiquidity;