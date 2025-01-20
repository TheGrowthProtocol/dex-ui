import React, { useEffect } from "react";
import { Box, Button, Typography } from "@material-ui/core";
import Coinfield from "../Components/coinfield";
import { TOKEN } from "../interfaces";
import ConnectWalletButton from "../Components/connectWalletButton";
import { useSnackbar } from "notistack";
import { AppDispatch, RootState } from "../store/store";

import { useWallet } from "../Hooks/useWallet";
import { useDispatch, useSelector } from "react-redux";
import { setToken1, setToken2, setAmount1, setAmount2 } from "../store/swap/swapSlice";
import { getAmount2, swap } from "../store/swap/swapThunks";

const Swap: React.FC<{}> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { isConnected } = useWallet();
  const { token1, token2, amount1, amount2, loading } = useSelector((state: RootState) => state.swap);
  const dispatch = useDispatch<AppDispatch>();


  useEffect(() => {
    if (amount1 > 0) {
      setCoinfield2Amount();
    }
  }, [amount1]);

  const setCoinfield2Amount = async () => {
    try {
      dispatch(getAmount2());
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };

  const handleSwap = () => {
    dispatch(swap());
  };

  const handleSwitch = () => {
    dispatch(setToken1(token2));
    dispatch(setToken2(token1));
    dispatch(setAmount1(amount2));
  };


  return (
    <>
      <Box className="tabpanel-container" sx={{ p: 3 }}>
        <Box className="tabpanel-content">
          <div className="swap-container">
            <Coinfield
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="swap-button-container">
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
        {!isConnected && (
          <ConnectWalletButton />
        )}
      </Box>
    </>
  );
};

export default Swap;
