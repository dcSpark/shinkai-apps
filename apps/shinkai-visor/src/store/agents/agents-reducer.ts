import { createSlice } from '@reduxjs/toolkit';

import { addAgent, getAgents } from './agents-actions';
import { AgentsState } from './agents-types';

const initialState: AgentsState = {
  agents: {
    status: 'idle',
  },
  add: {
    status: 'idle',
  },
};

export const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(addAgent.pending, (state, action) => {
        state.add.status = 'loading';
      })
      .addCase(addAgent.fulfilled, (state, action) => {
        state.add.status = 'succeeded';
        state.add.data = action.payload;
        state.agents.data = [
          ...(state.agents.data || []),
          action.payload.agent,
        ];
      })
      .addCase(addAgent.rejected, (state, action) => {
        state.add.status = 'failed';
        state.add.error = action.error.message;
      });

    builder
      .addCase(getAgents.pending, (state, action) => {
        state.agents.status = 'loading';
      })
      .addCase(getAgents.fulfilled, (state, action) => {
        state.agents.status = 'succeeded';
        state.agents.data = action.payload.agents;
      })
      .addCase(getAgents.rejected, (state, action) => {
        state.agents.status = 'failed';
        state.agents.error = action.error.message;
      });
  },
});
