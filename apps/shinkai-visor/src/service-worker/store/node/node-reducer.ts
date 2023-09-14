import { createSlice } from "@reduxjs/toolkit";

import { connectNode } from "./node-actions";
import { NodeStore } from "./node-types";



export const nodeSlice = createSlice({
  name: 'node',
  initialState: {
    status: 'idle',
    error: undefined,
    setupData: undefined,
  } as NodeStore,
  reducers: {
    // omit for now
  },
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
