import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type Auth = {
  profile: string;
  node_address: string;
  shinkai_identity: string;
  encryption_pk: string;
  identity_pk: string;
  api_v2_key: string;
};

type AuthStore = {
  auth: Auth | null;
  setAuth: (auth: Auth) => void;
  setLogout: () => void;
};

export const useAuth = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        auth: null,
        setAuth: (auth: Auth) => set({ auth }),
        setLogout: () => {
          set({ auth: null });
        },
      }),
      {
        name: 'auth',
      },
    ),
  ),
);
