import { type GetToolsCategory } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { createContext, createRef, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

type ToolsStore = {
  toolHomepageScrollPositionRef: React.RefObject<{
    [key: string]: number;
  } | null>;
  selectedToolCategory: GetToolsCategory | 'all';
  setSelectedToolCategory: (
    selectedToolCategory: GetToolsCategory | 'all',
  ) => void;
};

export const toolHomepageScrollPositionRef = createRef<{
  [key: string]: number;
}>() as React.RefObject<{
  [key: string]: number;
}>;
toolHomepageScrollPositionRef.current = {};

const createToolsStore = () =>
  createStore<ToolsStore>((set) => ({
    toolHomepageScrollPositionRef,
    selectedToolCategory: 'all',
    setSelectedToolCategory: (selectedToolCategory) =>
      set({ selectedToolCategory }),
  }));

const ToolsContext = createContext<ReturnType<typeof createToolsStore> | null>(
  null,
);

export const ToolsProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState<ReturnType<typeof createToolsStore>>(() =>
    createToolsStore(),
  );

  return (
    <ToolsContext.Provider value={store}>{children}</ToolsContext.Provider>
  );
};

export function useToolsStore<T>(selector: (state: ToolsStore) => T) {
  const store = useContext(ToolsContext);
  if (!store) {
    throw new Error('Missing ToolsProvider');
  }
  const value = useStore(store, selector);
  return value;
}
