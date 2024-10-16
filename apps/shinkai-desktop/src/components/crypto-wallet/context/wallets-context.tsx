import React, { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

export enum WalletCreateConnectView {
  Main = 'main',
  Mpc = 'mpc',
  MpcRestore = 'mpc-restore',
  Regular = 'regular',
  RegularCreate = 'regular-create',
  RegularMnemonic = 'regular-mnemonic',
  RegularPrivateKey = 'regular-private-key',
}

type WalletsStore = {
  walletCreationView: WalletCreateConnectView;
  setWalletCreationView: (walletCreationView: WalletCreateConnectView) => void;
  openWalletCreationModal: boolean;
  setOpenWalletCreationModal: (openWalletCreationModal: boolean) => void;
  resetWalletCreation: () => void;
};

const createWalletsStore = () =>
  createStore<WalletsStore>((set) => ({
    walletCreationView: WalletCreateConnectView.Main,
    setWalletCreationView: (walletCreationView) => {
      set({ walletCreationView });
    },

    openWalletCreationModal: false,
    setOpenWalletCreationModal: (openWalletCreationModal) => {
      set({ openWalletCreationModal });
    },
    resetWalletCreation: () => {
      set({
        walletCreationView: WalletCreateConnectView.Main,
        openWalletCreationModal: false,
      });
    },
  }));

const WalletsContext = createContext<ReturnType<
  typeof createWalletsStore
> | null>(null);

export const WalletsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [store] =
    useState<ReturnType<typeof createWalletsStore>>(createWalletsStore());

  return (
    <WalletsContext.Provider value={store}>{children}</WalletsContext.Provider>
  );
};

export function useWalletsStore<T>(selector: (state: WalletsStore) => T) {
  const store = useContext(WalletsContext);
  if (!store) {
    throw new Error('Missing WalletsProvider');
  }
  const value = useStore(store, selector);

  return value;
}
