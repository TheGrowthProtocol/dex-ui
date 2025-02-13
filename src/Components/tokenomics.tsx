import { Box, Typography } from "@material-ui/core";
import React, { useEffect } from "react";
import { POOL, Tokenomics as TokenomicsType } from "../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { fetchPoolTokenomics } from "../store/pool/poolThunks";
import { AppDispatch, RootState } from "../store/store";
import { resetPoolTokenomics } from "../store/pool/poolSlice";

interface TokenomicsProps {
  type: "swap" | "pool";
  selectedPool: POOL | null;
  isConnected: boolean;
}

export const Tokenomics: React.FC<TokenomicsProps> = ({
  type,
  selectedPool,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { amount1: swapAmount1, amount2: swapAmount2 } = useSelector(
    (state: RootState) => state.swap
  );
  const { amount1: liquidityAmount1, amount2: liquidityAmount2 } = useSelector(
    (state: RootState) => state.liquidity
  );
  const poolTokenomics: TokenomicsType | null = useSelector(
    (state: RootState) => state.pool.poolTokenomics
  );

  useEffect(() => {
    if (selectedPool) {
      const amount1 =
        type === "swap" ? Number(swapAmount1) : Number(liquidityAmount1);
      const amount2 =
        type === "swap" ? Number(swapAmount2) : Number(liquidityAmount2);

      dispatch(
        fetchPoolTokenomics({
          pool: selectedPool,
          swapAmount1: Number(amount1),
          swapAmount2: Number(amount2),
        })
      );
    } else {
      dispatch(resetPoolTokenomics());
    }
  }, [
    dispatch,
    type,
    selectedPool,
    swapAmount1,
    swapAmount2,
    liquidityAmount1,
    liquidityAmount2,
  ]);

  let displayTokenomicsItemKeys = [
    "priceImpact",
    "token0perToken1",
    "token1perToken0",
    "apr",
    "tvl",
    "currentRatio",
    "newRatio",
    "currentLPRate",
  ];
  let displayTokenomicsItemLabels = [
    "Price Impact",
    "Token 0 per Token 1",
    "Token 1 per Token 0",
    "APR",
    "TVL",
    "Current Ratio",
    "New Ratio",
    "Current LPRate",
  ];

  return (
    <Box className="tokenomics-container">
      <Box
        className="tokenomics-header"
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Typography variant="body2">Tokenomics</Typography>
      </Box>
      <Box className="tokenomics-content">
        {poolTokenomics &&
          displayTokenomicsItemKeys.map((key) => (
            <Box
              className="tokenomics-content__item"
              key={`tokenomics-${key}`}
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              <Typography variant="caption" color="textSecondary">
                {poolTokenomics[key].title}
              </Typography>
              <Typography variant="subtitle2" color="primary">
                {poolTokenomics[key].value}
              </Typography>
            </Box>
          ))}
        {!poolTokenomics &&
          displayTokenomicsItemLabels.map((label) => (
            <Box
              className="tokenomics-content__item"
              key={`tokenomics-${label}`}
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              <Typography variant="caption" color="textSecondary">
                {label}
              </Typography>
              <Typography variant="subtitle2" color="primary">
                --
              </Typography>
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export default Tokenomics;
