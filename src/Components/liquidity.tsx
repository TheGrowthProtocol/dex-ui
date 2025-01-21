import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid } from "@material-ui/core";
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

const Liquidity: React.FC<{}> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [openToken1Dialog, setOpenToken1Dialog] = useState(false);
  const [openToken2Dialog, setOpenToken2Dialog] = useState(false);
  const { token1, token2, loading } = useSelector(
    (state: RootState) => state.liquidity
  );
  const { tokens } = useSelector((state: RootState) => state.tokens);
  const { isConnected: isWalletConnected } = useWallet();

  console.log(token1, token2);

  useEffect(() => {
    if (token1.name === "") {
      dispatch(setToken1(tokens[0]));
    }
    if (token2.name === "") {
      dispatch(setToken2(tokens[1]));
    }
  }, [dispatch, token1, token2]);

  // Function to close the dialog
  const handleToken1DialogClose = () => {
    setOpenToken1Dialog(false);
  };

  // Function to handle selecting a token and its address
  const handleToken1Select = (token: TOKEN) => {
    dispatch(setToken1(token));
    setOpenToken1Dialog(false);
  };
  // Function to handle input change in the first field
  const handleTokenAmount1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.trim();
    if (!isNaN(Number(amount))) {
      dispatch(setAmount1(amount));
    }
  };

  // Function to close the dialog
  const handleToken2DialogClose = () => {
    setOpenToken2Dialog(false);
  };

  // Function to handle selecting a token and its address
  const handleToken2Select = (token: TOKEN) => {
    dispatch(setToken2(token));
    setOpenToken2Dialog(false);
  };

  // Function to handle input change in the second field
  const handleTokenAmount2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.trim();
    if (!isNaN(Number(amount))) {
      dispatch(setAmount2(amount));
    }
  };

  // Function to add liquidity pool
  const handleAddLiquidityPool = () => {
    dispatch(addLiquidity());
  };

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
              <Typography variant="subtitle2">Select Token Pair</Typography>
              <Box display="flex" className="coin-field-pair-container">
                <Button
                  variant="contained"
                  onClick={() => setOpenToken1Dialog(true)}
                  endIcon={<KeyboardArrowDownIcon color="primary" />}
                  className="coin-field-button"
                >
                  <CoinNoIcon />
                  <Typography className={"gradient-text token-symbol"}>
                    {token1.symbol || "Select Token"}
                  </Typography>
                </Button>
                <Coindialog
                  tokens={tokens}
                  isOpen={openToken1Dialog}
                  handleClose={handleToken1DialogClose}
                  onTokenSelect={handleToken1Select}
                />
                <Typography variant="h6" className="coin-field-pair-plus">
                  +
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setOpenToken2Dialog(true)}
                  endIcon={<KeyboardArrowDownIcon color="primary" />}
                  className="coin-field-button"
                >
                  <CoinNoIcon />
                  <Typography className={"token-symbol gradient-text"}>
                    {token2.symbol || "Select Token"}
                  </Typography>
                </Button>
                <Coindialog
                  tokens={tokens}
                  isOpen={openToken2Dialog}
                  handleClose={handleToken2DialogClose}
                  onTokenSelect={handleToken2Select}
                />
              </Box>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              className="coin-field-container"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                className="coin-field-container-title"
              >
                <Typography variant="body2">Deposit Amounts</Typography>
              </Box>
              <TokenInputField
                tokens={tokens}
                selectedToken={token1}
                onAmountChange={handleTokenAmount1}
                isDisplayBalance={isWalletConnected}
              />
              <Box
                className="liquidity-token-divider"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Box className="liquidity-token-divider-plus" />
              </Box>
              <TokenInputField
                tokens={tokens}
                selectedToken={token2}
                onAmountChange={handleTokenAmount2}
                isDisplayBalance={isWalletConnected}
              />
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
              onClick={handleAddLiquidityPool}
              disabled={!token1.address || !token2.address}
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  {loading ? "Adding..." : "Add Liquidity"}
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
            title: "APR (Annual % Rate)",
            value: "100,000,000"
          },
          {
            title: "Share of Pool",
            value: "100,000,000"
          },
          {
            title: "Current Token1 : Token2 Ratio in the pool",
            value: "100,000,000"
          },
          {
            title: "Current Token1-Token2 V2 LP Rate",
            value: "100,000,000"
          },
          {
            title: "Token1 per Token2",
            value: "100,000,000"
          },
          {
            title: "Token2 per Token1",
            value: "100,000,000"
          }
        ]}/>
      </Grid>
    </Grid>
  );
};

export default Liquidity;
