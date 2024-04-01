import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { ShinkaiNodeOptions } from '../windows/shinkai-node-manager/shinkai-node-process-client';

type ShinkaiNodeManagerStore = {
  shinkaiNodeOptions: Partial<ShinkaiNodeOptions> | null;
  setShinkaiNodeOptions: (shinkaiNodeOptions: Partial<ShinkaiNodeOptions>) => void;
};

export const useShinkaiNodeManager = create<ShinkaiNodeManagerStore>()(
  devtools(
    persist(
      (set) => ({
        shinkaiNodeOptions: null,
        setShinkaiNodeOptions: (shinkaiNodeOptions) => {
          set({ shinkaiNodeOptions });
        },
      }),
      {
        name: 'shinkai-node-options',
      },
    ),
  ),
);
