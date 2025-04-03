import React from "react";
import { Box, styled, Typography } from "@material-ui/core";
import { TOKEN } from "../interfaces";

interface LpReceiveInputTokenFieldProps {
    token: TOKEN;
    balance: string;
    usdValue: string;
}   

const StyledLpReceiveInputTokenField = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledLpReceiveInputTokenFieldSymbol = styled(Typography)(({ theme }) => ({
    fontSize: "16px",
    fontWeight: 600,
    textTransform: "uppercase",
    background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
}));

const StyledLpReceiveInputTokenFieldBalance = styled(Typography)(({ theme }) => ({
    fontSize: "14px",
    color: theme.palette.secondary.main,
}));

const StyledLpReceiveInputTokenFieldUsdValue = styled(Typography)(({ theme }) => ({
    fontSize: "14px",
    color: theme.palette.secondary.main,
}));

const LpReceiveInputTokenField: React.FC<LpReceiveInputTokenFieldProps> = ({ token, balance, usdValue }) => {
    return (
        <StyledLpReceiveInputTokenField>
            <StyledLpReceiveInputTokenFieldSymbol variant="subtitle1">{token.symbol}</StyledLpReceiveInputTokenFieldSymbol> 
            <StyledLpReceiveInputTokenFieldBalance variant="subtitle2">{balance}</StyledLpReceiveInputTokenFieldBalance>
            <StyledLpReceiveInputTokenFieldUsdValue variant="subtitle2">{usdValue}</StyledLpReceiveInputTokenFieldUsdValue>
        </StyledLpReceiveInputTokenField>
    );
};

export default LpReceiveInputTokenField;