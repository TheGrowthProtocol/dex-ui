import { Box } from '@material-ui/core';
import {styled} from "@material-ui/core/styles";

const StyledCoinIconPlaceholder = styled(Box)(({ theme }) => ({
  width: "24px",
  height: "24px",
  background: theme.palette.background.default,
  borderRadius: "24px",
  border: `1px solid ${theme.palette.primary.main}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const CoinIcon = ({ icon }: { icon: string }) => {
  return (
    <StyledCoinIconPlaceholder>
      <img src={icon} alt="Coin Icon" className="coin-icon" />
    </StyledCoinIconPlaceholder>
  );
};

export default CoinIcon;