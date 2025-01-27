import React, { useEffect } from "react";
import { Box, Button, Grid, Typography } from "@material-ui/core";
import Coinfield from "../Components/coinfield";
import { TOKEN } from "../interfaces";
import ConnectWalletButton from "../Components/connectWalletButton";
import { useSnackbar } from "notistack";
import { AppDispatch, RootState } from "../store/store";

import { useWallet } from "../Hooks/useWallet";
import { useDispatch, useSelector } from "react-redux";
import {
  setToken1,
  setToken2,
  setAmount1,
  setAmount2,
} from "../store/swap/swapSlice";
import { getAmount2, swap } from "../store/swap/swapThunks";
import { Tokenomics } from "../Components/tokenomics";
import { fetchPoolByTokenAddresses } from "../store/pool/poolThunks";
import { resetSelectedPool } from "../store/pool/poolSlice";

const Swap: React.FC<{}> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isConnected } = useWallet();
  const { token1, token2, amount1, amount2, loading } = useSelector(
    (state: RootState) => state.swap
  );
  const dispatch = useDispatch<AppDispatch>();
  const tokens = useSelector((state: RootState) => state.tokens.tokens);
  const { selectedPool, pools } = useSelector((state: RootState) => state.pool);

  useEffect(() => {
    if (tokens.length > 0) {
      dispatch(setToken1(tokens[0]));
    }
  }, [tokens, dispatch]);

  useEffect(() => {
    if (token1.address && token2.address) {
        if ( token1.address !== token2.address) {
            fetchPool();
        } else {
            enqueueSnackbar("Cannot swap the same token", { 
              variant: "error",
              autoHideDuration: 2000,
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
            });
            dispatch(resetSelectedPool());
          }
    }
  }, [pools, token1, token2, dispatch]);

  useEffect(() => {
    const setCoinfield2Amount = async () => {
      try {
        dispatch(getAmount2());
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: "error" });
      }
    };
    if (amount1 >0) {
      setCoinfield2Amount();
    } else {
      setAmount2(0);
    }
  }, [amount1, dispatch, enqueueSnackbar]);


  const fetchPool = async () => {
    try {
      console.log("fetching pool", token1.address, token2.address);
      await dispatch(fetchPoolByTokenAddresses([token1.address, token2.address])).unwrap();
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleSwap = async () => {
    try {
      await dispatch(swap()).unwrap();
      enqueueSnackbar("Swap successful!", {
        variant: "success",
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleSwitch = () => {
    dispatch(setToken1(token2));
    dispatch(setToken2(token1));
    dispatch(setAmount1(amount2));
  };

  return (
    <Grid container>
      <Grid item xs={12} md={12} lg={6}>
        <Box className="tabpanel-container" sx={{ p: 3 }}>
          <Box className="tabpanel-content">
            <div className="swap-container">
              <Coinfield
                title="Sell"
                value={amount1.toString()}
                setAmount={(amount) => dispatch(setAmount1(Number(amount)))}
                setSelectedToken={(token: TOKEN) => dispatch(setToken1(token))}
                selectedToken={token1}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant={"outlined"}
                  color="primary"
                  className="switch-field-button"
                  onClick={handleSwitch}
                />
              </Box>
              <Coinfield
                title="Buy"
                value={amount2.toString()}
                setAmount={(amount) => dispatch(setAmount2(Number(amount)))}
                setSelectedToken={(token: TOKEN) => dispatch(setToken2(token))}
                selectedToken={token2}
              />
              {/*<Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body1">
                      1 BNB = 0.00016 CAKE ($ 7.02)
                    </Typography>
                    <Typography variant="body1">
                      Price Impact: $ 1.14 (-2.26%)
                    </Typography>
                  </Box>
                </Box>*/}
            </div>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="swap-button-container"
        >
          {isConnected && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSwap}
              className="gradient-button swap-button"
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  {loading ? "Swapping..." : "Swap Tokens"}
                </Typography>
              </div>
            </Button>
          )}
          {!isConnected && <ConnectWalletButton />}
        </Box>
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <Tokenomics
          isConnected={isConnected}
          type="swap"
          selectedPool={selectedPool}
        />
      </Grid>
    </Grid>
  );
};

export default Swap;
