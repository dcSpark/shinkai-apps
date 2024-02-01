import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { ChromeStorage } from '../persistor/chrome-storage';

type SettingsData = {
  defaultAgentId: string;
  displayActionButton: boolean;
};

type SettingsStore = {
  settings: Partial<SettingsData> | null;
  setSettings: (settings: Partial<SettingsData>) => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        settings: null,
        setSettings: (settings) => {
          const valueChanged =
            JSON.stringify(get().settings) !== JSON.stringify(settings);
          set({ settings });
          if (valueChanged) {
            sendMessage({
              type: ServiceWorkerInternalMessageType.RehydrateStore,
            });
          }
        },
      }),
      {
        name: 'settings',
        storage: new ChromeStorage(),
      },
    ),
  ),
);
