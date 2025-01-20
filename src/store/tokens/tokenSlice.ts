import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchTokens } from "./tokenThunks";
import { TokenState, TOKEN } from "../../interfaces";

const initialState: TokenState = {
  tokens: [],
  loading: false,
  error: null,
};

const tokenSlice = createSlice({
  name: "tokens",   
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTokens.fulfilled, (state, action: PayloadAction<TOKEN[] | undefined>) => {
      state.tokens = action.payload ?? [];
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchTokens.pending, (state) => {
      state.tokens = [];
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTokens.rejected, (state, action) => {
      state.tokens = [];
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch tokens";
    });
  },
});

export default tokenSlice.reducer;
