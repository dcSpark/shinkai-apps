import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { ChromeStorage } from '../persistor/chrome-storage';

export type OnboardingData = {
  termsAcceptance: boolean | undefined;
  setTermsAcceptance: (termsAcceptance: boolean) => void;
  hasCredentialsEncrypted: boolean | undefined;
  setHasCredentialsEncrypted: (hasCredentialsEncrypted: boolean) => void;
};

export const useOnboarding = create<OnboardingData>()(
  devtools(
    persist(
      (set, get) => ({
        termsAcceptance: undefined,
        setTermsAcceptance: (termsAcceptance) => {
          const valueChanged = get().termsAcceptance !== termsAcceptance;
          set({ termsAcceptance });
          if (valueChanged) {
            sendMessage({
              type: ServiceWorkerInternalMessageType.RehydrateStore,
            });
          }
        },
        hasCredentialsEncrypted: undefined,
        setHasCredentialsEncrypted: (hasCredentialsEncrypted) => {
          const valueChanged =
            get().hasCredentialsEncrypted !== hasCredentialsEncrypted;
          set({ hasCredentialsEncrypted });
          if (valueChanged) {
            sendMessage({
              type: ServiceWorkerInternalMessageType.RehydrateStore,
            });
          }
        },
      }),
      {
        name: 'onboarding',
        storage: new ChromeStorage<OnboardingData>(),
      },
    ),
  ),
);
