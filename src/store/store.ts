import { configureStore } from '@reduxjs/toolkit';
import liquidityReducer from './liquidity/liquiditySlice';

export const store = configureStore({
  reducer: {
    liquidity: liquidityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;