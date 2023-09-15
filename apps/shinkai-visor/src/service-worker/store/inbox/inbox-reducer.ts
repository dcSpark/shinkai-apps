import { createSlice } from "@reduxjs/toolkit";

import { createInbox, getAllInboxes } from "./inbox-actions";
import { InboxState } from "./inbox-types";

const initialState: InboxState = {
  all: {
    status: 'idle',
  },
  create: {
    status: 'idle',
  }
}

export const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    createInbox: (state, action) => {
      state.all.data = [...state.all.data || [], action.payload.inbox];
    }
  },
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

      .addCase(createInbox.pending, (state, action) => {
        state.create.status = 'loading'
      })
      .addCase(createInbox.fulfilled, (state, action) => {
        state.create.status = 'succeeded';
        state.create.data = action.payload;
      })
      .addCase(createInbox.rejected, (state, action) => {
        state.create.status = 'failed'
        state.create.error = action.error.message;
      })
  }
});
