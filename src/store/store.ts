import { configureStore } from '@reduxjs/toolkit';
import liquidityReducer from './liquidity/liquiditySlice';
import tokenReducer from './tokens/tokenSlice';
import walletReducer from './wallet/walletSlice';
import networkReducer from './network/networkSlice';
import swapReducer from './swap/swapSlice';
import poolReducer from './pool/poolSlice';

export const store = configureStore({
  reducer: {
    liquidity: liquidityReducer,
    swap: swapReducer,
    tokens: tokenReducer,
    wallet: walletReducer,
    network: networkReducer,
    pool: poolReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;