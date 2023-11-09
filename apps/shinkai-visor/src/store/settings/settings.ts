import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { ChromeStorage } from "../persistor/chrome-storage";

type SettingsData = {
  defaultAgentId: string | undefined;
};

type SettingsStore = {
  settings: SettingsData | null;
  setSettings: (settings: SettingsData) => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        settings: null,
        setSettings: (settings: SettingsData) => set({ settings }),
      }),
      {
        name: "settings",
        storage: new ChromeStorage(),
      }
    )
  )
);
