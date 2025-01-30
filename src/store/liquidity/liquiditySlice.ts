import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOKEN, LiquidityState } from '../../interfaces';


const initialState: LiquidityState = {
  token1: { name: '', symbol: '', address: '' },
  token2: { name: '', symbol: '', address: '' },
  amount1: '0',
  amount2: '0',
  amount1Min: '0',
  amount2Min: '0',
  loading: false,
  error: null,
  provider: null,
  signer: null,
};

const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers: {
    setToken1: (state, action: PayloadAction<TOKEN>) => {
      state.token1 = action.payload;
    },
    setToken2: (state, action: PayloadAction<TOKEN>) => {
      state.token2 = action.payload;
    },
    setAmount1: (state, action: PayloadAction<string>) => {
      state.amount1 = action.payload;
    },
    setAmount2: (state, action: PayloadAction<string>) => {
      state.amount2 = action.payload;
    },
    setAmount1Min: (state, action: PayloadAction<string>) => {
      state.amount1Min = action.payload;
    },
    setAmount2Min: (state, action: PayloadAction<string>) => {
      state.amount2Min = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetLiquidityState: (state) => {
      return initialState;
    },
  },
});

export const {
  setToken1,
  setToken2,
  setAmount1,
  setAmount2,
  setAmount1Min,
  setAmount2Min,
  setLoading,
  setError,
  resetLiquidityState,
} = liquiditySlice.actions;

export default liquiditySlice.reducer;