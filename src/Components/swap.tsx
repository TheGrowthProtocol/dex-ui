import React, { useEffect } from "react";
import { Box, Button, Typography } from "@material-ui/core";
import Coinfield1 from "../Components/coinfield1";
import Coinfield2 from "../Components/coinfield2";
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
  const { token1, token2, amount1, amount2, loading, error } = useSelector((state: RootState) => state.swap);
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

  // TODO: Add logic to token1 and token2
  /**useEffect(() => {

    },[])**/

  const handleSwap = () => {
    dispatch(swap());
  };

  return (
    <>
      <Box className="tabpanel-container" sx={{ p: 3 }}>
        <Box className="tabpanel-content">
          <div className="swap-container">
            <Coinfield1
              value={amount1.toString()}
              setAmount={(amount) => dispatch(setAmount1(Number(amount)))}
              setSelectedToken={(token: TOKEN) => dispatch(setToken1(token))}
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
              />
            </Box>
            <Coinfield2
              value={amount2.toString()}
              setAmount={(amount) => dispatch(setAmount2(Number(amount)))}
              setSelectedToken={(token: TOKEN) => dispatch(setToken2(token))}
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
