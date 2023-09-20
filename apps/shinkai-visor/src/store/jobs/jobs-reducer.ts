import { createSlice } from '@reduxjs/toolkit';

import { createJob } from './jobs-actions';
import { JobsState } from './jobs-types';

const initialState: JobsState = {
  create: {
    status: 'idle',
  },
};

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(createJob.pending, (state, action) => {
        state.create.status = 'loading';
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.create.status = 'succeeded';
        state.create.data = action.payload;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.create.status = 'failed';
        state.create.error = action.error.message;
      });
  },
});
