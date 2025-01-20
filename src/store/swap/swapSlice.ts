import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOKEN, SwapState } from '../../interfaces';


const initialState: SwapState = {
  token1: { name: '', symbol: '', address: '' },
  token2: { name: '', symbol: '', address: '' },
  amount1: 0.0,
  amount2: 0.0,
  loading: false,
  error: null,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setToken1: (state, action: PayloadAction<TOKEN>) => {
      state.token1 = action.payload;
    },
    setToken2: (state, action: PayloadAction<TOKEN>) => {
      state.token2 = action.payload;
    },
    setAmount1: (state, action: PayloadAction<number>) => {
      state.amount1 = action.payload;
    },
    setAmount2: (state, action: PayloadAction<number>) => {
      state.amount2 = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetSwapState: (state) => {
      return initialState;
    },
  },
});

export const {
  setToken1,
  setToken2,
  setAmount1,
  setAmount2,
  setLoading,
  setError,
  resetSwapState,
} = swapSlice.actions;

export default swapSlice.reducer;