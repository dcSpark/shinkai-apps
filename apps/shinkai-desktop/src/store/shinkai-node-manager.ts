import { invoke } from '@tauri-apps/api';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { ShinkaiNodeOptions } from '../lib/shinkai-node-manager/shinkai-node-manager-client-types';
import { isLocalShinkaiNode } from '../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { useAuth } from './auth';

type ShinkaiNodeManagerStore = {
  isInUse: boolean | null;
  setIsInUse: (value: boolean) => void;
  shinkaiNodeOptions: Partial<ShinkaiNodeOptions> | null;
  setShinkaiNodeOptions: (
    shinkaiNodeOptions: Partial<ShinkaiNodeOptions>,
  ) => void;
};

export const useShinkaiNodeManager = create<ShinkaiNodeManagerStore>()(
  devtools(
    persist(
      (set) => ({
        isInUse: false,
        shinkaiNodeOptions: null,
        setShinkaiNodeOptions: (shinkaiNodeOptions) => {
          set({ shinkaiNodeOptions });
        },
        setIsInUse: (value: boolean) => {
          set({ isInUse: value });
        },
      }),
      {
        name: 'shinkai-node-options',
      },
    ),
  ),
);

useAuth.subscribe((state) => {
  handleAuthSideEffect(state.auth?.node_address || '');
});

const handleAuthSideEffect = async (nodeAddress: string) => {
  const isLocal = isLocalShinkaiNode(nodeAddress);
  const isRunning: boolean = await invoke('shinkai_node_is_running');
  useShinkaiNodeManager.getState().setIsInUse(isLocal && isRunning);
};
