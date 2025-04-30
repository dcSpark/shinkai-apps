import { createRef } from 'react';
import { create } from 'zustand';

type ViewportStore = {
  mainLayoutContainerRef: React.RefObject<HTMLDivElement>;
};

export const useViewportStore = create<ViewportStore>()(() => ({
  mainLayoutContainerRef: createRef<HTMLDivElement>(),
}));
