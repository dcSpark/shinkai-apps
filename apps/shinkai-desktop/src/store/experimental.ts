import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// eslint-disable-next-line @typescript-eslint/ban-types
type ExperimentalStore = {};

export const useExperimental = create<ExperimentalStore>()(
  devtools(
    persist((set, get) => ({}), {
      name: 'experimental',
    }),
  ),
);
