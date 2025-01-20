import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isConnected: boolean;
  chainId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: NetworkState = {
  isConnected: false,
  chainId: null,
  loading: false,
  error: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    connectNetworkStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    connectNetworkSuccess: (state, action: PayloadAction<string>) => {
      state.chainId = action.payload;
      state.isConnected = true;
      state.loading = false;
      state.error = null;
    },
    connectNetworkFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    disconnectNetwork: (state) => {
      state.isConnected = false;
      state.chainId = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  connectNetworkStart,
  connectNetworkSuccess,
  connectNetworkFailure,
  disconnectNetwork,
} = networkSlice.actions;

export default networkSlice.reducer;