import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import React, { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

import { VectorFsActions } from '../components/vector-fs-drawer';

export enum VectorFSLayout {
  Grid = 'grid',
  List = 'list',
}

type VectorFsStore = {
  currentGlobalPath: string;
  setCurrentGlobalPath: (path: string) => void;
  activeDrawerMenuOption: VectorFsActions | null;
  setActiveDrawerMenuOption: (drawerMenuOption: VectorFsActions | null) => void;
  closeDrawerMenu: () => void;
  layout: VectorFSLayout;
  setLayout: (layout: VectorFSLayout) => void;
  isSortByName: boolean;
  setSortByName: (sortByName: boolean) => void;
  isVRSelectionActive: boolean;
  setVRSelectionActive: (isVRSelectionActive: boolean) => void;
  selectedFile: VRItem | null;
  setSelectedFile: (selectedFile: VRItem | null) => void;
  selectedFolder: VRFolder | null;
  setSelectedFolder: (selectedFolder: VRFolder | null) => void;
  selectedVectorFsTab: 'all' | 'shared-folders';
  setSelectedVectorFsTab: (
    selectedVectorFsTab: 'all' | 'shared-folders',
  ) => void;
};

const createVectorFsStore = () =>
  createStore<VectorFsStore>((set) => ({
    activeDrawerMenuOption: null,
    setActiveDrawerMenuOption: (activeDrawerMenuOption) => {
      set({ activeDrawerMenuOption });
    },

    currentGlobalPath: '/',
    setCurrentGlobalPath: (path: string) => {
      set({ currentGlobalPath: path });
    },
    closeDrawerMenu: () => {
      set({ activeDrawerMenuOption: null });
    },

    layout: VectorFSLayout.List,
    setLayout: (layout) => {
      set({ layout });
    },

    isSortByName: false,
    setSortByName: (isSortByName) => {
      set({ isSortByName });
    },

    isVRSelectionActive: false,
    setVRSelectionActive: (isVRSelectionActive) => {
      set({ isVRSelectionActive });
    },

    selectedFile: null,
    setSelectedFile: (selectedFile) => {
      set({ selectedFile });
    },

    selectedFolder: null,
    setSelectedFolder: (selectedFolder) => {
      set({ selectedFolder });
    },

    selectedVectorFsTab: 'all',
    setSelectedVectorFsTab: (selectedVectorFsTab) => {
      set({ selectedVectorFsTab });
    },
  }));

const VectorFsContext = createContext<ReturnType<
  typeof createVectorFsStore
> | null>(null);

export const VectorFsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<ReturnType<typeof createVectorFsStore>>();
  if (!storeRef.current) {
    storeRef.current = createVectorFsStore();
  }
  return (
    <VectorFsContext.Provider value={storeRef.current}>
      {children}
    </VectorFsContext.Provider>
  );
};

export function useVectorFsStore<T>(selector: (state: VectorFsStore) => T) {
  const store = useContext(VectorFsContext);
  if (!store) {
    throw new Error('Missing VectorFsProvider');
  }
  const value = useStore(store, selector);
  return value;
}
