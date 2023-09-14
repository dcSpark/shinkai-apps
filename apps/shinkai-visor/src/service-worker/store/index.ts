import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

import * as authActions from './auth/auth-actions';
import { authSlice } from './auth/auth-reducer';
import { ChromeStorage } from './chrome-storage';
import * as nodeActions from './node/node-actions';
import { nodeSlice } from './node/node-reducer';

const reducer = combineReducers({
  node: nodeSlice.reducer,
  auth: authSlice.reducer,
});
const persistedReducer = persistReducer(
  {
    key: 'root',
    storage: new ChromeStorage('local'),
  },
  reducer
);

export const store = configureStore({
  reducer: persistedReducer,
});

export const storePersistor = persistStore(store);

export const actions = {
  ...nodeActions,
  ...authActions,
};
