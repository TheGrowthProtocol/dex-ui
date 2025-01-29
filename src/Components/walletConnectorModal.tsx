import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  Box, 
  Typography, 
  IconButton,
  Grid
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

// Import wallet icons
import metamaskIcon from '../assets/wallet/MetaMask.svg';
import { useWallet } from '../Hooks/useWallet';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: '#1A1A1A',
      borderRadius: '24px',
      maxWidth: '480px',
      width: '100%'
    }
  },
  title: {
    padding: theme.spacing(2),
    color: '#FFFFFF'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: '#FFFFFF'
  },
  walletOption: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    backgroundColor: '#2C2C2C',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#3C3C3C',
      transform: 'translateY(-2px)'
    }
  },
  walletIcon: {
    width: '32px',
    height: '32px',
    marginRight: theme.spacing(2)
  },
  walletName: {
    color: '#FFFFFF',
    fontWeight: 500
  },
  walletDescription: {
    color: '#9E9E9E',
    fontSize: '0.875rem'
  }
}));

interface WalletOption {
  name: string;
  icon: string;
  description: string;
  onClick: () => Promise<void>;
}

interface WalletConnectorModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletConnectorModal: React.FC<WalletConnectorModalProps> = ({ open, onClose }) => {
  const classes = useStyles();
  const { connectMetaMask } = useWallet();

  const walletOptions: WalletOption[] = [
    {
      name: 'MetaMask',
      icon: metamaskIcon,
      description: 'Connect using browser wallet',
      onClick: async () => {
        //await connectMetaMask();
        onClose();
      }
    },
  ];

  const handleWalletClick = async (wallet: WalletOption) => {
    try {
      await wallet.onClick();
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      className={classes.dialog}
      fullWidth
    >
      <DialogTitle className={classes.title}>
        Connect Wallet
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box p={2}>
        <Grid container direction="column" spacing={2}>
          {walletOptions.map((wallet) => (
            <Grid item key={wallet.name}>
              <Box 
                className={classes.walletOption}
                onClick={() => handleWalletClick(wallet)}
                display="flex"
                alignItems="center"
              >
                <img 
                  src={wallet.icon} 
                  alt={wallet.name} 
                  className={classes.walletIcon}
                />
                <Box>
                  <Typography className={classes.walletName}>
                    {wallet.name}
                  </Typography>
                  <Typography className={classes.walletDescription}>
                    {wallet.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Dialog>
  );
};

export default WalletConnectorModal;