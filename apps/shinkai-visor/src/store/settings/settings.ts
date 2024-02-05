import { Coordinates } from '@dnd-kit/utilities';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { ChromeStorage } from '../persistor/chrome-storage';

type SettingsStore = {
  displayActionButton: boolean;
  setDisplayActionButton: (displayButton: boolean) => void;
  sideButtonOffset: Coordinates;
  setSideButtonOffset: (fn: (prev: Coordinates) => Coordinates) => void;
  defaultAgentId: string;
  setDefaultAgentId: (defaultAgentId: string) => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        displayActionButton: true,
        setDisplayActionButton: (displayActionButton) => {
          set({ displayActionButton });
          sendMessage({
            type: ServiceWorkerInternalMessageType.RehydrateStore,
          });
        },
        defaultAgentId: '',
        setDefaultAgentId: (defaultAgentId) => {
          set({ defaultAgentId });
        },
        sideButtonOffset: { x: 0, y: 10 },
        setSideButtonOffset: (fn: (prev: Coordinates) => Coordinates) => {
          set((state) => ({ sideButtonOffset: fn(state.sideButtonOffset) }));
        },
      }),
      {
        name: 'settings',
        storage: new ChromeStorage(),
      },
    ),
  ),
);
