import { configureStore } from '@reduxjs/toolkit';

import { nodeSlice } from './node-reducer';

export * as thunks from './thunks';

export const store = configureStore(
  // persistedReducer,
  // composeEnhancers(applyMiddleware(thunk))
  {
    reducer: {
      node: nodeSlice.reducer,
    },
  }
);
