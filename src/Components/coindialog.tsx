import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Input,
} from "@material-ui/core";
import { COINDIALOG } from "../interfaces";

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
      <DialogTitle 
        id="alert-dialog-title" 
        className="coin-dialog__title"
      >
        {"Select a Coin"}
      </DialogTitle>
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
      <List className="coin-dialog__list">
        {tokens.length > 0 &&
          tokens.map((token) => (
            <ListItem
              button
              key={token.address}
              onClick={() => onTokenSelect(token)}
              className="coin-dialog__list-item"
            >
              <ListItemText 
                primary={`${token.name} (${token.symbol})`}
                className="coin-dialog__list-item-text" 
              />
            </ListItem>
          ))}
      </List>
    </Dialog>
  );
};

export default Coindialog;
