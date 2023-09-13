import { createAsyncThunk } from '@reduxjs/toolkit';
import { submitRegistrationCode } from '@shinkai/shinkai-message-ts/api';
import { SetupPayload } from '@shinkai/shinkai-message-ts/models';

export const connectNode = createAsyncThunk<void, SetupPayload>(
  'node/connect',
  async (useRegistrationCodePayload) => {
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
      const success = await submitRegistrationCode(useRegistrationCodePayload);
      if (success) {
        // Dispatch node connected
        return;
      }
    } catch (e) {
      // Dispatch node connection error
    }
  }
);
