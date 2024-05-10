import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type SettingsStore = {
  defaultAgentId: string;
  setDefaultAgentId: (defaultAgentId: string) => void;
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        defaultAgentId: '',
        setDefaultAgentId: (defaultAgentId) => {
          set({ defaultAgentId });
        },

        sidebarExpanded: true,
        toggleSidebar: () => {
          set((state) => ({ sidebarExpanded: !state.sidebarExpanded }));
        },
      }),
      {
        name: 'settings',
      },
    ),
  ),
);
