import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type SettingsStore = {
  defaultAgentId: string;
  setDefaultAgentId: (defaultAgentId: string) => void;
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  isGetStartedChecklistHidden: boolean;
  setGetStartedChecklistHidden: (isGetStartedChecklistHidden: boolean) => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        defaultAgentId: '',
        setDefaultAgentId: (defaultAgentId) => {
          set({ defaultAgentId });
        },

        sidebarExpanded: false,
        toggleSidebar: () => {
          set((state) => ({ sidebarExpanded: !state.sidebarExpanded }));
        },

        isGetStartedChecklistHidden: false,
        setGetStartedChecklistHidden: (isGetStartedChecklistHidden) => {
          set({ isGetStartedChecklistHidden });
        },
      }),
      {
        name: 'settings',
      },
    ),
  ),
);
