import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { POOL } from '../../interfaces';

interface PoolState {
  pools: POOL[];
  selectedPool: POOL | null;
  loading: boolean;
  error: string | null;
  myPools: POOL[];
}

const initialState: PoolState = {
  pools: [],
  selectedPool: null,
  loading: false,
  error: null,
  myPools: [],
};

const poolSlice = createSlice({
  name: 'pool',
  initialState,
  reducers: {
    selectPool: (state, action: PayloadAction<POOL>) => {
      state.selectedPool = action.payload;
    },
    setPools: (state, action: PayloadAction<POOL[]>) => {
      state.pools = action.payload;
    },
    setMyPools: (state, action: PayloadAction<POOL[]>) => {
      state.myPools = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  selectPool,
  setPools,
  setMyPools,
  setLoading,
  setError,
} = poolSlice.actions;

export default poolSlice.reducer;

