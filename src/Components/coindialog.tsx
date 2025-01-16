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

const Coindialog: React.FC<COINDIALOG> = ({
  tokens,
  handleClose,
  isOpen,
  onTokenSelect,
}) => {
  const [tokenAddress, setTokenAddress] = useState<string>("");

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth={true}
      className="coin-dialog"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <DialogTitle id="alert-dialog-title" className="coin-dialog__title">
          {"Select a token"}
        </DialogTitle>
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
                <CoinNoIcon />
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
    </Dialog>
  );
};

export default Coindialog;
