import { SetupPayload } from '@shinkai_network/shinkai-message-ts/models';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type AuthStore = {
  auth: SetupPayload | null;
  setAuth: (auth: SetupPayload) => void;
  setLogout: () => void;
};

export const useAuth = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        auth: null,
        setAuth: (auth: SetupPayload) => set({ auth }),
        setLogout: () => set({ auth: null }),
      }),
      {
        name: 'auth',
      }
    )
  )
);
