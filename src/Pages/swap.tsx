import React, { useEffect, useCallback, useState } from "react";
import { Box, Button, Grid, styled, Typography } from "@material-ui/core";
import Coinfield from "../Components/coinfield";
import { TOKEN } from "../interfaces";
import ConnectWalletButton from "../Components/connectWalletButton";
import { AppDispatch, RootState } from "../store/store";

import { useDispatch, useSelector } from "react-redux";
import {
  setToken1,
  setToken2,
  setAmount1,
  setAmount2,
} from "../store/swap/swapSlice";
import { getAmount1, getAmount2, swap } from "../store/swap/swapThunks";
import { Tokenomics } from "../Components/tokenomics";
import { fetchPoolByTokenAddresses } from "../store/pool/poolThunks";
import { resetSelectedPool } from "../store/pool/poolSlice";
import { useSnackbarContext } from "../Contexts/snackbarContext";
import { useProviderContext } from "../Contexts/providerContext";
import { ethers } from "ethers";

const StyledSwapButton = styled(Button)(({ theme }) => ({
  "&:disabled": {
    opacity: 0.5,
  },
}));


const Swap: React.FC<{}> = () => {
  const { showSnackbar } = useSnackbarContext();
  const { token1, token2, amount1, amount2, loading } = useSelector(
    (state: RootState) => state.swap
  );
  const { isConnected: isWalletConnected } = useSelector(
    (state: RootState) => state.wallet
  );
  const dispatch = useDispatch<AppDispatch>();
  const tokens = useSelector((state: RootState) => state.tokens.tokens);
  const { selectedPool } = useSelector((state: RootState) => state.pool);
  const { provider } = useProviderContext();

  const fetchPool = useCallback(async () => {
    try {
      await dispatch(fetchPoolByTokenAddresses([token1.address, token2.address])).unwrap();
    } catch (error: any) {
      showSnackbar(error.message, "error");
    }
  }, [token1.address, token2.address, dispatch, showSnackbar]);

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
            showSnackbar("Please select two different tokens", "error");
            dispatch(resetSelectedPool());
          }
    }
  }, [token1, token2, dispatch, showSnackbar, fetchPool]);

  const handleSetToken1 = (token: TOKEN) => {
    dispatch(setToken1(token));
    if(token.address !== token2.address && Number(amount2) > 0) {
      setCoinfield1Amount();
    } else if(token.address === token2.address && Number(amount1) > 0) {
      setCoinfield2Amount();
    } else {
      dispatch(setAmount1(0));
      dispatch(setAmount2(0));
    }
  };

  const handleSetToken2 = (token: TOKEN) => {
    dispatch(setToken2(token));
    if(token.address !== token1.address && Number(amount1) > 0) {
      setCoinfield2Amount();
    } else if(token.address === token1.address && Number(amount2) > 0) {
      setCoinfield1Amount();
    } else {
      dispatch(setAmount1(0));
      dispatch(setAmount2(0));
    }
  };

  const setCoinfield2Amount = async () => {
    try {
      if (!provider) {
        throw new Error("Provider not found");
      }
      const web3Provider = new ethers.providers.Web3Provider(provider);
      await dispatch(getAmount2(web3Provider)).unwrap();
    } catch (error: any) {
      console.error(error);
      dispatch(setAmount2(0));
    }
  };

  const setCoinfield1Amount = async () => {
    try {
      if (!provider) {
        throw new Error("Provider not found");
      }
      const web3Provider = new ethers.providers.Web3Provider(provider);
      await dispatch(getAmount1(web3Provider)).unwrap();
    } catch (error: any) {
      console.error(error);
      dispatch(setAmount1(0));
    }
  };

  const handleSetAmount1 = async (amount: string) => {
    const formattedAmount = Number(amount).toFixed(2);
    dispatch(setAmount1(Number(formattedAmount)));
    await setCoinfield2Amount();
  };

  const handleSetAmount2 = async (amount: string) => {
    const formattedAmount = Number(amount).toFixed(2);
    dispatch(setAmount2(Number(formattedAmount)));
    await setCoinfield1Amount();
  };

  const handleSwap = async () => {
    try {
      if (!provider) {
        throw new Error("Provider not found");
      }
      const web3Provider = new ethers.providers.Web3Provider(provider);
      await dispatch(swap(web3Provider)).unwrap();
      showSnackbar("Swap successful!", "success");
      dispatch(setAmount1(0));
      dispatch(setAmount2(0));
    } catch (error: any) {
      showSnackbar(error.message, "error");
      dispatch(setAmount1(0));
      dispatch(setAmount2(0));
    }
  };

  const handleSwitch = async () => {
    dispatch(setToken1(token2));
    dispatch(setToken2(token1));
    dispatch(setAmount1(amount2));
    dispatch(setAmount2(amount1));
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
                setAmount={(amount) => handleSetAmount1(amount)}
                setSelectedToken={(token: TOKEN) => handleSetToken1(token)}
                selectedToken={token1}
                isDisabledAmountField={false}
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
                setAmount={(amount) => handleSetAmount2(amount)}
                setSelectedToken={(token: TOKEN) => handleSetToken2(token)}
                selectedToken={token2}
                isDisabledAmountField={true}
              />
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
          {isWalletConnected && (
            <StyledSwapButton
              variant="contained"
              color="primary"
              onClick={handleSwap}
              className="gradient-button swap-button"
              disabled={amount1 === 0 || amount2 === 0}
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  {loading ? "Swapping..." : "Swap Tokens"}
                </Typography>
              </div>
            </StyledSwapButton>
          )}
          {!isWalletConnected && <ConnectWalletButton />}
        </Box>
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <Tokenomics
          isConnected={isWalletConnected}
          type="swap"
          selectedPool={selectedPool}
        />
      </Grid>
    </Grid>
  );
};

export default Swap;
