import { configureStore } from '@reduxjs/toolkit';

import { nodeSlice } from './node/node-reducer';
import * as nodeThunks from './node/node-thunks';

export const store = configureStore({
  reducer: {
    node: nodeSlice.reducer,
  },
});

export const actions = {
  ...nodeThunks,
};
