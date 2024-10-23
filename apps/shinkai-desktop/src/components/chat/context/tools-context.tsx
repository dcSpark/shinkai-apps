import {
  ToolState,
  WidgetToolState,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import React, { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

type ToolsStore = {
  tool: ToolState | null;
  setTool: (tool: ToolState | null) => void;
  widget: WidgetToolState | null;
  setWidget: (widget: WidgetToolState | null) => void;
};

const createToolsStore = () =>
  createStore<ToolsStore>((set) => ({
    tool: null,
    setTool: (tool) => set({ tool }),
    // TODO:  unify in the frontend side
    widget: null,
    setWidget: (widget) => set({ widget }),
  }));

const ToolsContext = createContext<ReturnType<typeof createToolsStore> | null>(
  null,
);

export const ToolsProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] =
    useState<ReturnType<typeof createToolsStore>>(createToolsStore());

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
