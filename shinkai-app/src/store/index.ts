import { createStore, applyMiddleware, Store } from 'redux';
import thunk, { ThunkAction } from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import rootReducer, { RootState as RootStateFromReducer } from './reducers';
import { Action } from 'redux';

export type RootState = RootStateFromReducer;

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
  whitelist: ['registrationStatus', 'setupDetailsState']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
