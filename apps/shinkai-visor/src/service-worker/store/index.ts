import { combineReducers, configureStore } from '@reduxjs/toolkit';
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

import * as authActions from './auth/auth-actions';
import { authSlice } from './auth/auth-reducer';
import { inboxSlice } from './inbox/inbox-reducer';
import * as nodeActions from './node/node-actions';
import { nodeSlice } from './node/node-reducer';
import { ChromeStorage } from './persistor/chrome-storage';

const reducer = combineReducers({
  node: nodeSlice.reducer,
  auth: authSlice.reducer,
  inbox: inboxSlice.reducer,
});

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage: chrome?.runtime ? new ChromeStorage('local') : localStorage,
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
};

export type RootState = ReturnType<typeof store.getState>;
