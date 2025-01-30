import { Box, Typography } from '@material-ui/core';
import {styled} from "@material-ui/core/styles";

const StyledCoinNoIconPlaceholder = styled(Box)(({ theme }) => ({
  width: "24px",
  height: "24px",
  background: theme.palette.background.default,
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: "24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const CoinNoIcon = () => {
  return (
    <StyledCoinNoIconPlaceholder>
      <Typography variant="subtitle1" className="coin-noicon-text gradient-text">?</Typography>
    </StyledCoinNoIconPlaceholder>
  );
};

export default CoinNoIcon;