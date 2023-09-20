import { createSlice } from "@reduxjs/toolkit";

import { connectNode } from "./node-actions";
import { NodeStore } from "./node-types";

const initialState: NodeStore = {
  status: 'idle',
  error: undefined,
  data: undefined,
}

export const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(connectNode.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(connectNode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(connectNode.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message;
      })
  }
});
