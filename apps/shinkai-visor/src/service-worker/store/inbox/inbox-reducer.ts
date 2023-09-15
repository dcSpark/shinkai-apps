import { createSlice } from "@reduxjs/toolkit";

import { getAllInboxes } from "./inbox-actions";
import { InboxState } from "./inbox-types";

const initialState: InboxState = {
  all: {
    status: 'idle',
  },
}

export const inboxSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getAllInboxes.pending, (state, action) => {
        state.all.status = 'loading'
      })
      .addCase(getAllInboxes.fulfilled, (state, action) => {
        state.all.status = 'succeeded';
        state.all.data = action.payload;
      })
      .addCase(getAllInboxes.rejected, (state, action) => {
        state.all.status = 'failed'
        state.all.error = action.error.message;
      })
  }
});
