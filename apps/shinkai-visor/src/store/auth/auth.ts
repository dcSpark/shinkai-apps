import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type SetupData = {
  profile: string;
  permission_type: string;
  registration_name: string;
  node_address: string;
  shinkai_identity: string;
  node_encryption_pk: string;
  node_signature_pk: string;
  profile_encryption_sk: string;
  profile_encryption_pk: string;
  profile_identity_sk: string;
  profile_identity_pk: string;
  my_device_encryption_sk: string;
  my_device_encryption_pk: string;
  my_device_identity_sk: string;
  my_device_identity_pk: string;
};
type AuthStore = {
  auth: SetupData | null;
  setAuth: (auth: SetupData) => void;
  setLogout: () => void;
};

export const useAuth = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        auth: null,
        setAuth: (auth: SetupData) => set({ auth }),
        setLogout: () => set({ auth: null }),
      }),
      {
        name: "auth",
      }
    )
  )
);
