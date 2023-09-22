import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import localStorage from 'redux-persist/es/storage';

import * as agentsActions from './agents/agents-actions';
import { agentsSlice } from './agents/agents-reducer';
import * as authActions from './auth/auth-actions';
import { authSlice } from './auth/auth-reducer';
import { inboxSlice } from './inbox/inbox-reducer';
import * as jobsActions from './jobs/jobs-actions';
import { jobsSlice } from './jobs/jobs-reducer';
import * as nodeActions from './node/node-actions';
import { nodeSlice } from './node/node-reducer';
import { ChromeStorage } from './persistor/chrome-storage';

const reducer = combineReducers({
  node: nodeSlice.reducer,
  auth: authSlice.reducer,
  inbox: inboxSlice.reducer,
  agents: agentsSlice.reducer,
  jobs: jobsSlice.reducer,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage: chrome?.runtime ? new ChromeStorage('local') : localStorage,
    whitelist: ['node', 'auth']
  },
  reducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const storePersistor = persistStore(store);

export const actions = {
  ...nodeActions,
  ...authActions,
  ...agentsActions,
  ...jobsActions,
};

export type RootState = ReturnType<typeof store.getState>;

export const useTypedDispatch = () => useDispatch<typeof store.dispatch>();
