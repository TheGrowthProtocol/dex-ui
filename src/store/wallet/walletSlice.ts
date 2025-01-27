import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  loading: boolean;
  error: string | null;

}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWalletStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    connectWalletSuccess: (state, action: PayloadAction<string>) => {
      state.isConnected = true;
      state.address = action.payload;
      state.loading = false;
      state.error = null;
    },
    connectWalletFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  connectWalletStart,
  connectWalletSuccess,
  connectWalletFailure,
  disconnectWallet,
} = walletSlice.actions;

export default walletSlice.reducer;