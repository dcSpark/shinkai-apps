import React, { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';

export interface SelectedCell {
  isFocused: boolean;
  rowId: string;
  columnId: string;
}

type TableSheetStore = {
  selectedCell: SelectedCell | null;
  setSelectedCell: (cell?: SelectedCell | null) => void;
  showChatPanel: boolean;
  setShowChatPanel: (show: boolean) => void;
  toggleChatPanel: () => void;
};

const createTableSheetStore = () =>
  createStore<TableSheetStore>((set) => ({
    selectedCell: null,
    setSelectedCell: (cell) =>
      set({
        selectedCell: cell,
      }),
    showChatPanel: false,
    setShowChatPanel: (show) =>
      set({
        showChatPanel: show,
      }),
    toggleChatPanel: () =>
      set((state) => ({
        showChatPanel: !state.showChatPanel,
      })),
  }));

const TableSheetContext = createContext<ReturnType<
  typeof createTableSheetStore
> | null>(null);

export const TableSheetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [context] = useState<ReturnType<typeof createTableSheetStore>>(
    createTableSheetStore(),
  );

  return (
    <TableSheetContext.Provider value={context}>
      {children}
    </TableSheetContext.Provider>
  );
};

export function useSheetProjectStore<T>(
  selector: (state: TableSheetStore) => T,
) {
  const store = useContext(TableSheetContext);
  if (!store) {
    throw new Error('Missing VectorFsProvider');
  }
  const value = useStore(store, selector);
  return value;
}
