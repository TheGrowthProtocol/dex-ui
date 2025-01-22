import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { POOL, TOKEN } from '../../interfaces';
import { fetchShareBalances } from './poolThunks';

interface PoolState {
  pools: POOL[];
  selectedPool: POOL | null;
  loading: boolean;
  error: string | null;
  myPools: POOL[];
  removeLpToken0Share: RemoveLpTokenShareState | undefined;
  removeLpToken1Share: RemoveLpTokenShareState | undefined;
}

const initialState: PoolState = {
  pools: [],
  selectedPool: null,
  loading: false,
  error: null,
  myPools: [],
  removeLpToken0Share: undefined,
  removeLpToken1Share: undefined,
};

interface RemoveLpTokenShareState {
    token: TOKEN;
    amount: string;
}


const poolSlice = createSlice({
  name: 'pool',
  initialState,
  reducers: {
    setSelectedPool: (state, action: PayloadAction<POOL>) => {
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
    setRemoveLpToken0Share: (state, action: PayloadAction<RemoveLpTokenShareState>) => {
      state.removeLpToken0Share = action.payload;
    },
    setRemoveLpToken1Share: (state, action: PayloadAction<RemoveLpTokenShareState>) => {
      state.removeLpToken1Share = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchShareBalances.fulfilled, (state, action) => {
        state.removeLpToken0Share = action.payload.token0Share;
        state.removeLpToken1Share = action.payload.token1Share;
    });
  },
});

export const {
    setSelectedPool,
  setPools,
  setMyPools,
  setLoading,
  setError,
  setRemoveLpToken0Share,
  setRemoveLpToken1Share,
} = poolSlice.actions;

export default poolSlice.reducer;

