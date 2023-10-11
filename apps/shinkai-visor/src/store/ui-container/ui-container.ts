import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type UIContainerData = {
  shadowRoot: ShadowRoot;
  rootElement: HTMLElement;
};

type UIContainerStore = {
  uiContainer: UIContainerData | null;
  setUIContainer: (uiContainer: UIContainerData) => void;
};

export const useUIContainer = create<UIContainerStore>()(
  devtools(
    (set) => ({
      uiContainer: null,
      setUIContainer: (uiContainer: UIContainerData) => set({ uiContainer }),
    }),
    {
      name: "ui-container",
    }
  )
);
