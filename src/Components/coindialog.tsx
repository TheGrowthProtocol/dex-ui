import React, { useState,  } from 'react'
import { Dialog, DialogTitle, Box, Typography, List, ListItem, ListItemText } from '@material-ui/core'
import { COINDIALOG } from '../interfaces';

const Coindialog: React.FC<COINDIALOG> = ({ tokens, handleClose, isOpen, onTokenSelect }) => {
    const [tokenAddress, setTokenAddress] = useState<string>("");

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth={true}>
            <DialogTitle id="alert-dialog-title">{"Select a Coin"}</DialogTitle>
            <Box sx={{ padding: 2 }}>
            <Typography variant="subtitle1">Token Address</Typography>
            <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
            />
            </Box>
            <List>
          {tokens.length > 0 && tokens.map((token) => (
            <ListItem
              button
              key={token.address}
              onClick={() => onTokenSelect(token)}
            >
              <ListItemText primary={`${token.name} (${token.symbol})`} />
            </ListItem>
          ))}
        </List>
        </Dialog>)
    
}

export default Coindialog