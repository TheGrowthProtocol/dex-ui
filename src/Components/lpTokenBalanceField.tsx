import React from "react";
import { Box, Typography } from "@material-ui/core";

interface LpTokenBalanceFieldProps {
    title: string;
    balance: string;
    usdValue: string;
}

const LpTokenBalanceField: React.FC<LpTokenBalanceFieldProps> = ({ title, balance, usdValue }) => {
    return (
        <Box display="flex" flexDirection="column" className="lp-token-balance-field">
            <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
            <Typography variant="subtitle1" color="primary">{balance}</Typography>
            <Typography variant="subtitle2" color="primary">{usdValue}</Typography>
        </Box>
    );
};

export default LpTokenBalanceField;