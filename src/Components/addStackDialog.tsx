import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@material-ui/core';

interface AddStakeDialogProps {
  open: boolean;
  onClose: () => void;
  onTransact: (value: string, poolId: string) => void;
  title?: string;
  poolId: string;
}

const AddStakeDialog: React.FC<AddStakeDialogProps> = ({
  open,
  onClose,
  onTransact,
  title = 'Enter Transaction Value',
  poolId
}) => {
  const [value, setValue] = useState('');

  const handleTransact = () => {
    onTransact(value, poolId);
    setValue(''); // Reset value
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="Amount"
            type="number"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputProps={{ min: 0, step: "0.000000000000000001" }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleTransact} 
          color="primary" 
          variant="contained"
          disabled={!value || Number(value) <= 0}
        >
          Transact
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStakeDialog;
