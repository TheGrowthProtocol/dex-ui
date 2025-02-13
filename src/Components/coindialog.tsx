import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  Box,
  List,
  ListItem,
  ListItemText,
  Input,
  ListItemIcon,
  Typography,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";
import { COINDIALOG } from "../interfaces";
import CoinNoIcon from "./coinNoIcon";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import CloseIcon from "@material-ui/icons/Close";
import CoinIcon from "./coinIcon";
import {styled} from "@material-ui/core/styles";

const StyledCoinDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
    borderRadius: "12px",
    padding: "1px",
  }
}));

const StyledCoinDialogContainer = styled(Box)(({ theme }) => ({
  background: "radial-gradient(86.33% 299.52% at 13.67% 23.12%, #272727 0%, #0E0E0E 100%)",
  borderRadius: "12px",
  padding: "24px",
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: `${theme.palette.primary.main} !important`,
  padding: "0 !important",
}));

const Coindialog: React.FC<COINDIALOG> = ({
  isOpen,
  handleClose,
  onTokenSelect,
  tokens,
}) => {
  const [tokenAddress, setTokenAddress] = useState<string>("");

  return (
    <StyledCoinDialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth={true}
      className="coin-dialog"
    >
      <StyledCoinDialogContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <StyledDialogTitle id="alert-dialog-title">
          {"Select a token"}
        </StyledDialogTitle>
        <IconButton onClick={handleClose} className="coin-dialog__close-button">
          <CloseIcon color="primary" fontSize="medium" />
        </IconButton>
      </Box>
      <Box sx={{ padding: 2 }} className="coin-dialog__input-container">
        <Input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          className="coin-dialog__input"
          placeholder="Search for a token"
          fullWidth
        />
      </Box>
      <Box
        sx={{ padding: 2 }}
        className="coin-dialog__tokens-container"
        display="flex"
        justifyContent="flex-start"
      >
        <AccountBalanceWalletIcon fontSize="small" />
        <Typography
          variant="subtitle2"
          className="coin-dialog__tokens-container-title"
        >
          Tokens
        </Typography>
      </Box>
      <List className="coin-dialog__list">
        {tokens.length > 0 &&
          tokens.map((token) => (
            <ListItem
              button
              key={token.address}
              onClick={() => onTokenSelect(token)}
              className="coin-dialog__list-item"
            >
              <ListItemIcon className="coin-dialog__list-item-icon">
                {token.icon && <CoinIcon icon={token.icon} />}
                {!token.icon && <CoinNoIcon />}
              </ListItemIcon>
              <ListItemText
                primary={`${token.name} (${token.symbol})`}
                className="coin-dialog__list-item-text gradient-text"
              />
              <ListItemSecondaryAction>
                <ArrowForwardIcon color="primary" fontSize="medium" />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>
      </StyledCoinDialogContainer>
    </StyledCoinDialog>
  );
};

export default Coindialog;
