import { createAction } from '@reduxjs/toolkit';

export const authenticated = createAction<boolean>('auth/authenticated');
