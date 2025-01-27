import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { POOL, TOKEN, Tokenomics } from '../../interfaces';
import { fetchPoolTokenomics, fetchShareBalances } from './poolThunks';

interface PoolState {
  pools: POOL[];
  selectedPool: POOL | null;
  loading: boolean;
  error: string | null;
  myPools: POOL[];
  removeLpToken0Share?: RemoveLpTokenShareState;
  removeLpToken1Share?: RemoveLpTokenShareState;
  poolTokenomics: Tokenomics | null;
  removeLpTokenBalance?: string;
}

const initialState: PoolState = {
  pools: [],
  selectedPool: null,
  loading: false,
  error: null,
  myPools: [],
  removeLpToken0Share: undefined,
  removeLpToken1Share: undefined,
  poolTokenomics: null,
  removeLpTokenBalance: undefined,
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
    setRemoveLpTokenBalance: (state, action: PayloadAction<string>) => {
      state.removeLpTokenBalance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchShareBalances.fulfilled, (state, action) => {
        state.removeLpToken0Share = action.payload.token0Share;
        state.removeLpToken1Share = action.payload.token1Share;
    });
    builder.addCase(fetchPoolTokenomics.fulfilled, (state, action) => {
        state.poolTokenomics = action.payload;
    });
  },
});

export const {
    setSelectedPool,
  setPools,
  setMyPools,
  setLoading,
  setError,
  setRemoveLpTokenBalance,
} = poolSlice.actions;

export default poolSlice.reducer;

