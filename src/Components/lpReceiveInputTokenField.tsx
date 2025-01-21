import React from "react";
import { Box, Typography } from "@material-ui/core";
import { TOKEN } from "../interfaces";

interface LpReceiveInputTokenFieldProps {
    token: TOKEN;
    balance: string;
    usdValue: string;
}

const LpReceiveInputTokenField: React.FC<LpReceiveInputTokenFieldProps> = ({ token, balance, usdValue }) => {
    return (
        <Box display="flex" flexDirection="column" className="lp-receive-input-token-field">
            <Typography variant="subtitle2">{token.symbol}</Typography>
            <Typography variant="subtitle2">{balance}</Typography>
            <Typography variant="subtitle2">{usdValue}</Typography>
        </Box>
    );
};

export default LpReceiveInputTokenField;