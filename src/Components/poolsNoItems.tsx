import React from "react";
import { Box, Button, Typography, useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import CoinPairIcons from "./coinPairIcons";


export const PoolsNoItems: React.FC<{
  description: string;

}> = ({ description }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); 
    const handleAddLiquidityPool = () => {
        // TODO: Add Liquidity
    }

  return (
    <Box className="pools-table__empty" display="flex" justifyContent="space-between" alignItems="center" flexDirection={isMobile ? "column" : "row"}>
        <Box display="flex" flexDirection="row" alignItems="center">
            <CoinPairIcons />
            <Typography variant="body2">{description}</Typography>
        </Box>
        <Box>
           <Button
              variant="contained"
              color="primary"
              className={"gradient-button liquidity-add-button"}
              onClick={handleAddLiquidityPool}
            >
              <div className="button-angled-clip">
                <Typography className={"gradient-text"}>
                  Add Liquidity
                </Typography>
              </div>
            </Button> 
        </Box>
    </Box>
  );
};
