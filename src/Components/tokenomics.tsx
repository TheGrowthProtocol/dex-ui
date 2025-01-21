import { Box, Typography } from "@material-ui/core";
import React from "react";

export const Tokenomics: React.FC = () => {
    return (
        <Box className="tokenomics-container">
            <Box className="tokenomics-header" display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                <Typography variant="subtitle1">Tokenomics</Typography>
            </Box>
            <Box className="tokenomics-content">
                <Box className="tokenomics-content__item" display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
                    <Typography variant="subtitle2">Total Supply</Typography>
                    <Typography variant="subtitle2">100,000,000</Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Tokenomics;