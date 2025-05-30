import { type ShinkaiPath } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { type TreeCheckboxSelectionKeys } from 'primereact/tree';
import React, { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

import {
  KnowledgeSearchDrawer,
  SetJobScopeDrawer,
} from '../set-conversation-context';

type SetJobScopeStore = {
  isSetJobScopeOpen: boolean;
  setSetJobScopeOpen: (isSetJobScopeOpen: boolean) => void;
  selectedKeys: TreeCheckboxSelectionKeys | null;
  onSelectedKeysChange: (value: TreeCheckboxSelectionKeys | null) => void;
  selectedFileKeysRef: Map<string, ShinkaiPath>;
  selectedFolderKeysRef: Map<string, ShinkaiPath>;

  isKnowledgeSearchOpen: boolean;
  setKnowledgeSearchOpen: (isKnowledgeSearchOpen: boolean) => void;

  resetJobScope: () => void;
};

const createVectorFsStore = () =>
  createStore<SetJobScopeStore>((set) => ({
    isSetJobScopeOpen: false,
    setSetJobScopeOpen: (isSetJobScopeOpen) => {
      set({ isSetJobScopeOpen });
    },
    selectedKeys: null,
    onSelectedKeysChange: (selectedKeys) => {
      set({ selectedKeys });
    },
    selectedFileKeysRef: new Map<string, ShinkaiPath>(),
    selectedFolderKeysRef: new Map<string, ShinkaiPath>(),

    isKnowledgeSearchOpen: false,
    setKnowledgeSearchOpen: (isKnowledgeSearchOpen) => {
      set({ isKnowledgeSearchOpen });
    },
    resetJobScope: () => {
      set({
        isSetJobScopeOpen: false,
        selectedKeys: null,
        selectedFileKeysRef: new Map<string, ShinkaiPath>(),
        selectedFolderKeysRef: new Map<string, ShinkaiPath>(),
        isKnowledgeSearchOpen: false,
      });
    },
  }));

const SetJobScopeContext = createContext<ReturnType<
  typeof createVectorFsStore
> | null>(null);

export const SetJobScopeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [store] = useState<ReturnType<typeof createVectorFsStore>>(
    createVectorFsStore(),
  );
  return (
    <SetJobScopeContext.Provider value={store}>
      {children}
      <SetJobScopeDrawer />
      <KnowledgeSearchDrawer />
    </SetJobScopeContext.Provider>
  );
};

export function useSetJobScope<T>(selector: (state: SetJobScopeStore) => T) {
  const store = useContext(SetJobScopeContext);
  if (!store) {
    throw new Error('Missing SetJobScopeProvider');
  }
  const value = useStore(store, selector);
  return value;
}
