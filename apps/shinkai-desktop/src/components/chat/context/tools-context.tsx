import { WidgetToolState } from '@shinkai_network/shinkai-message-ts/api/general/types';
import React, { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

type FormattedTool = {
  key: string;
  name: string;
  description: string;
};

type ToolsStore = {
  widget: WidgetToolState | null;
  setWidget: (widget: WidgetToolState | null) => void;
  selectedTool: FormattedTool | null;
  setSelectedTool: (selectedTool: FormattedTool | null) => void;
};

const createToolsStore = () =>
  createStore<ToolsStore>((set) => ({
    // TODO:  external widgets eg: PaymentCard, later we should unify to toolCalls
    widget: null,
    setWidget: (widget) => set({ widget }),
    // selected tool for chat conversation
    selectedTool: null,
    setSelectedTool: (selectedTool) => set({ selectedTool }),
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
