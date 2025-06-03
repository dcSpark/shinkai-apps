import { debug } from '@tauri-apps/plugin-log';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { type ShinkaiNodeOptions } from '../lib/shinkai-node-manager/shinkai-node-manager-client-types';

type ShinkaiNodeManagerStore = {
  isInUse: boolean | null;
  setIsInUse: (value: boolean) => void;
  shinkaiNodeOptions: Partial<ShinkaiNodeOptions> | null;
  setShinkaiNodeOptions: (
    shinkaiNodeOptions: Partial<ShinkaiNodeOptions> | null,
  ) => void;
};

export const useShinkaiNodeManager = create<ShinkaiNodeManagerStore>()(
  devtools(
    persist(
      (set) => ({
        isInUse: false,
        shinkaiNodeOptions: null,
        setShinkaiNodeOptions: (shinkaiNodeOptions) => {
          void debug('setting shinkai-node options');
          set({ shinkaiNodeOptions });
        },
        setIsInUse: (value: boolean) => {
          void debug('setting is in use');
          set({ isInUse: value });
        },
      }),
      {
        name: 'shinkai-node-options',
      },
    ),
  ),
);
