import { createStore, applyMiddleware, Store, compose } from 'redux';
import thunk, { ThunkAction } from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import rootReducer from './reducers';
import { Action } from 'redux';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = Store['dispatch'];

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['other', 'setupDetails'],
  debug: true,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Use Redux DevTools extension if it's installed in the user's browser
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk))
);
export const persistor = persistStore(store);
