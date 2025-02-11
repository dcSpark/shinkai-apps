import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { createContext, useContext, useState } from 'react';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

type Status = 'idle' | 'pending' | 'success' | 'error';

type PlaygroundStore = {
  // code
  toolCodeStatus: Status;
  setToolCodeStatus: (toolCodeStatus: Status) => void;
  toolCode: string;
  setToolCode: (toolCode: string) => void;
  toolCodeError: string | null;
  setToolCodeError: (toolCodeError: string | null) => void;
  // metadata
  toolMetadataStatus: Status;
  setToolMetadataStatus: (toolMetadataStatus: Status) => void;
  toolMetadata: ToolMetadata | null;
  setToolMetadata: (toolMetadata: ToolMetadata | null) => void;
  toolMetadataError: string | null;
  setToolMetadataError: (toolMetadataError: string | null) => void;
  // execution result
  toolResult: object | null;
  setToolResult: (toolResult: object | null) => void;
};

const createPlaygroundStore = () =>
  createStore<PlaygroundStore>((set) => ({
    // code
    toolCodeStatus: 'idle',
    setToolCodeStatus: (toolCodeStatus) => set({ toolCodeStatus }),
    toolCode: '',
    setToolCode: (toolCode) => set({ toolCode }),
    toolCodeError: null,
    setToolCodeError: (toolCodeError) => set({ toolCodeError }),
    // metadata
    toolMetadataStatus: 'idle',
    setToolMetadataStatus: (toolMetadataStatus) => set({ toolMetadataStatus }),
    toolMetadata: null,
    setToolMetadata: (toolMetadata) => set({ toolMetadata }),
    toolMetadataError: null,
    setToolMetadataError: (toolMetadataError) => set({ toolMetadataError }),
    // execution result
    toolResult: null,
    setToolResult: (toolResult) => set({ toolResult }),
  }));

const PlaygroundContext = createContext<ReturnType<
  typeof createPlaygroundStore
> | null>(null);

export const PlaygroundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [store] = useState<ReturnType<typeof createPlaygroundStore>>(
    createPlaygroundStore(),
  );

  return (
    <PlaygroundContext.Provider value={store}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export function usePlaygroundStore<T>(selector: (state: PlaygroundStore) => T) {
  const store = useContext(PlaygroundContext);
  if (!store) {
    throw new Error('Missing PlaygroundProvider');
  }
  const value = useStore(store, selector);
  return value;
}
