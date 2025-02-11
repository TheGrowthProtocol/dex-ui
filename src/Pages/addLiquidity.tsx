import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, styled } from "@material-ui/core";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { TOKEN } from "../interfaces";
import Coindialog from "../Components/coindialog";
import TokenInputField from "../Components/TokenInputField";
import { addLiquidity } from "../store/liquidity/liquidityThunks";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  setToken1,
  setToken2,
  setAmount1,
  setAmount2,
  resetLiquidityState,
} from "../store/liquidity/liquiditySlice";
import CoinNoIcon from "../Components/coinNoIcon";
import { useWallet } from "../Hooks/useWallet";
import ConnectWalletButton from "../Components/connectWalletButton";
import { fetchPoolByTokenAddresses } from "../store/pool/poolThunks";
import CoinIcon from "../Components/coinIcon";
import { useSnackbarContext } from "../Contexts/snackbarContext";
import { useProviderContext } from "../Contexts/providerContext";
import { ethers } from "ethers";

const StyledAddLiquidityButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "16px",
}));

const AddLiquidity: React.FC<{onClose: () => void}> = ({onClose}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSnackbar } = useSnackbarContext();
  const [openToken1Dialog, setOpenToken1Dialog] = useState(false);
  const [openToken2Dialog, setOpenToken2Dialog] = useState(false);
  const { token1, token2, amount1, amount2, loading } = useSelector(
    (state: RootState) => state.liquidity
  );
  const { tokens } = useSelector((state: RootState) => state.tokens as { tokens: TOKEN[] });
  const { selectedPool } = useSelector((state: RootState) => state.pool);
  const { isConnected: isWalletConnected } = useWallet();
  const { provider } = useProviderContext(); 

  useEffect(() => {
    if (tokens.length > 0) {
      dispatch(setToken1(tokens[0]));
    }
  }, [dispatch, tokens]);

  useEffect(() => {
    if (selectedPool) {
      dispatch(setToken1(selectedPool.token0));
      dispatch(setToken2(selectedPool.token1));
    }
  }, [dispatch, selectedPool]);

  useEffect(() => { 
      if (token1.address!=="" && token2.address!=="") {
        if (token1.address !== token2.address) {
          dispatch(fetchPoolByTokenAddresses([token1.address, token2.address]));
        } else {
          showSnackbar("Please select two different tokens", "error");
        }
      }
  }, [token1, token2, dispatch, showSnackbar]);



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
  const handleTokenAmount1 = (amount: string) => {
    if (!isNaN(Number(amount))) {
      dispatch(setAmount1(amount));

      // Calculate and set amount2 based on pool ratio
      if (selectedPool && amount) {
        const poolRatio = Number(selectedPool.token1Reserve) / Number(selectedPool.token0Reserve);
        const calculatedAmount2 = (Number(amount) * poolRatio).toString();
        dispatch(setAmount2(calculatedAmount2));
      } else {
        dispatch(setAmount2(""));
      }
    } else {
      dispatch(setAmount1(""));
      dispatch(setAmount2(""));
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
  const handleTokenAmount2 = (amount: string) => {
    if (!isNaN(Number(amount))) {
      dispatch(setAmount2(amount));

      // Calculate and set amount1 based on pool ratio
      if (selectedPool && amount) {
        const poolRatio = Number(selectedPool.token0Reserve) / Number(selectedPool.token1Reserve);
        const calculatedAmount1 = (Number(amount) * poolRatio).toString();
        dispatch(setAmount1(calculatedAmount1));
      } else {
        dispatch(setAmount1(""));
      }
    } else {
      dispatch(setAmount2(""));
      dispatch(setAmount1(""));
    }
  };

  // Function to add liquidity pool
  const handleAddLiquidityPool = async () => {
    try {
      if (!provider) {
        showSnackbar("Please connect your wallet", "error");
        return;
      }
      const web3Provider = new ethers.providers.Web3Provider(provider); 
      await dispatch(addLiquidity(web3Provider)).unwrap();
      showSnackbar("Liquidity added successfully", "success");
      dispatch(setAmount1(""));
      dispatch(setAmount2(""));
      dispatch(setToken2({address: "", symbol: "", icon: "", name: ""}));
      onClose();
    } catch (error) {
      console.log('error', error);
      showSnackbar("Error adding liquidity", "error");
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} md={12} lg={12}>
          <Box>
            <Box
              display="flex"
              flexDirection="column"
              className="coin-field-container coin-field-pair-block"
            >
              <Typography variant="subtitle2">Select Token Pair</Typography>
              <Box display="flex" className="coin-field-pair-container" alignItems="center">
                <Button
                  variant="contained"
                  onClick={() => setOpenToken1Dialog(true)}
                  endIcon={<KeyboardArrowDownIcon color="primary" />}
                  className="coin-field-button"
                >
                  {token1.icon && <CoinIcon icon={token1.icon} />}
                  {!token1.icon && <CoinNoIcon />}
                  <Typography className={"gradient-text token-symbol"}>
                    {token1.symbol === 'WCERS' ? 'CERES' : token1.symbol || "Select Token"}
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
                  {token2.icon && <CoinIcon icon={token2.icon} />}
                  {!token2.icon && <CoinNoIcon />}
                  <Typography className={"token-symbol gradient-text"}>
                    {token2.symbol === 'WCERS' ? 'CERES' : token2.symbol || "Select Token"}
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
                value={amount1 === "0" ? "" : amount1.toString()}
                selectedToken={token1}
                onAmountChange={handleTokenAmount1}
                isDisplayBalance={isWalletConnected}
              />
              {
                token2.symbol !== "" && (
                  <>
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
                      value={amount2 === "0" ? "" : amount2.toString()}
                      onAmountChange={handleTokenAmount2}
                      isDisplayBalance={isWalletConnected}
                    />
                  </>
                )
              }
              
            </Box>
          </Box>
        
          <StyledAddLiquidityButtonContainer>
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
        </StyledAddLiquidityButtonContainer>
      </Grid>
      {/*<Grid item xs={12} md={12} lg={12}>
        <Tokenomics 
        isConnected={isWalletConnected}
        type="pool"
        selectedPool={selectedPool}
        />
      </Grid>*/}
    </Grid>
  );
};

export default AddLiquidity;