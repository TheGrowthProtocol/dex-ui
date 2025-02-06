import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  Box, 
  Typography, 
  IconButton,
  Grid,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, styled } from '@material-ui/core/styles';

// Import wallet icons
import metamaskIcon from '../assets/wallet/Metamask.svg';
import { useWallet } from '../Hooks/useWallet';
import { useSnackbarContext } from '../Contexts/snackbarContext';
const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.text.primary
  },
  walletIcon: {
    width: '32px',
    height: '32px',
    marginRight: theme.spacing(2)
  },
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

const StyledWalletConnectorModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
    borderRadius: "12px",
    padding: "1px",
    width: "384px",
  }
}));

const StyledWalletConnectorModalContainer = styled(Box)(({ theme }) => ({
  background: "radial-gradient(86.33% 299.52% at 13.67% 23.12%, #272727 0%, #0E0E0E 100%)",
  borderRadius: "12px",
}));

const StyledWalletConnectorModalTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 'bold',
  background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
  backgroundClip: "text",
  color: "transparent",
}));

const StyledWalletOption = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  cursor: 'pointer',
}));

const StyledWalletName = styled(Typography)(({ theme }) => ({
    background: "linear-gradient(90deg, #926128 0%, #B99A45 25%, #E3D6B4 50%, #B99A45 79%, #916027 100%)",
    backgroundClip: "text",
    color: "transparent",
    fontWeight: 500
}));

const StyledWalletDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem'
}));

const StyledWalletConnectorModalContent = styled(Box)(({ theme }) => ({
  padding: "8px 16px",
}));

const StyledWalletConnectorModalFooter = styled(Box)(({ theme }) => ({
  padding: "8px 16px",
  color: theme.palette.text.secondary,
  fontSize: "12px",
}));



const WalletConnectorModal: React.FC<WalletConnectorModalProps> = ({ open, onClose }) => {
  const classes = useStyles();
  const { connectMetaMask,error } = useWallet();
  const { showSnackbar } = useSnackbarContext();
  const walletOptions: WalletOption[] = [
    {
      name: 'MetaMask',
      icon: metamaskIcon,
      description: 'Connect using browser wallet',
      onClick: async () => {
          await connectMetaMask();
          onClose();
      }
    },
  ];

  const handleWalletClick = async (wallet: WalletOption) => {
    try {
      await wallet.onClick();
      onClose();
    } catch (error: any) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleWalletConnection = async () => {
    try {
      // Check if any ethereum provider exists
      if (typeof window.ethereum !== 'undefined') {
        // Get all available ethereum providers
        const providers = window.ethereum.providers || [window.ethereum];
        
        // Find MetaMask provider specifically
        const metaMaskProvider = providers.find((provider: any) => 
          provider.isMetaMask
        );

        if (!metaMaskProvider) {
          throw new Error('MetaMask not found. Please install MetaMask.');
        }

        // Request account access using the MetaMask provider
        const accounts = await metaMaskProvider.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Connect using the first account
        const account = accounts[0];
        // ... handle successful connection
        
      } else {
        throw new Error('No Ethereum provider found. Please install MetaMask.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Handle error appropriately
    }
  };

  const detectWallets = () => {
    if (typeof window.ethereum !== 'undefined') {
      const providers = window.ethereum.providers || [window.ethereum];
      console.log(providers);
      const availableWallets = providers.map((provider: any) => ({
        //isMetaMask: provider.isMetaMask,
        provider: provider
      }));

      return availableWallets;
    }
    return [];
  };

  // You can use this to show available options to users
  const availableWallets = detectWallets();

  return (
    <StyledWalletConnectorModal 
      open={open} 
      onClose={onClose}
      fullWidth
    >
    
      <StyledWalletConnectorModalContainer>
        <StyledWalletConnectorModalTitle>
            Connect a wallet
            <IconButton className={classes.closeButton} onClick={onClose}>
            <CloseIcon color='primary'/>
            </IconButton>
        </StyledWalletConnectorModalTitle>
      
      <StyledWalletConnectorModalContent>
        <Grid container direction="column" spacing={2}>
          {walletOptions.map((wallet) => (
            <Grid item key={wallet.name}>
              <StyledWalletOption
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
                  <StyledWalletName>
                    {wallet.name}
                  </StyledWalletName>
                  <StyledWalletDescription>
                    {wallet.description}
                  </StyledWalletDescription>
                </Box>
              </StyledWalletOption>
            </Grid>
          ))}
          </Grid>
          <StyledWalletConnectorModalFooter>
          By connecting a wallet, you agree to TheGrowthProtocol Terms of Service and consent to its Privacy Policy.
          </StyledWalletConnectorModalFooter>
        </StyledWalletConnectorModalContent>
      </StyledWalletConnectorModalContainer>
    </StyledWalletConnectorModal>
  );
};

export default WalletConnectorModal;