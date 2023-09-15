import { createSlice } from '@reduxjs/toolkit';

import { AuthStore } from './auth-types';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: 'unauthenticated',
  } as AuthStore,
  reducers: {
    authenticated: (state, action) => {
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
  },
});
