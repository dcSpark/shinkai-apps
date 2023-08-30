import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { sendMessage } from "../../service-worker/communication/internal";
import { ServiceWorkerInternalMessageType } from "../../service-worker/communication/internal/types";
import { ChromeStorage } from "../persistor/chrome-storage";

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
  setAuth: (auth: SetupData | null) => void;
};

export const useAuth = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        auth: null,
        setAuth: (auth) => {
          const valueChanged = JSON.stringify(get().auth) !== JSON.stringify(auth);
          set({ auth });
          if (valueChanged) {
            sendMessage({ type: ServiceWorkerInternalMessageType.RehydrateStore });
          }
        },
      }),
      {
        name: "auth",
        storage: new ChromeStorage<SetupData>(),
      }
    )
  )
);
