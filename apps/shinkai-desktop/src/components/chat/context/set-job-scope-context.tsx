import {
  VectorFSFolderScopeEntry,
  VectorFSItemScopeEntry,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import React, { createContext, useContext, useRef } from 'react';
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
  selectedFileKeysRef: Map<string, VectorFSItemScopeEntry>;
  selectedFolderKeysRef: Map<string, VectorFSFolderScopeEntry>;

  isKnowledgeSearchOpen: boolean;
  setKnowledgeSearchOpen: (isKnowledgeSearchOpen: boolean) => void;
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
    selectedFileKeysRef: new Map(),
    selectedFolderKeysRef: new Map(),

    isKnowledgeSearchOpen: false,
    setKnowledgeSearchOpen: (isKnowledgeSearchOpen) => {
      set({ isKnowledgeSearchOpen });
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
  const storeRef = useRef<ReturnType<typeof createVectorFsStore>>();
  if (!storeRef.current) {
    storeRef.current = createVectorFsStore();
  }
  return (
    <SetJobScopeContext.Provider value={storeRef.current}>
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