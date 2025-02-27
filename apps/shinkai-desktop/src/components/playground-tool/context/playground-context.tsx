import {
  GetToolsCategory,
  ToolMetadata,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { PrismEditor } from 'prism-react-editor';
import {
  createContext,
  createRef,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

type Status = 'idle' | 'pending' | 'success' | 'error';

type PlaygroundStore = {
  // inboxId
  chatInboxId: string | undefined;
  setChatInboxId: (chatInboxId: string | undefined) => void;
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
  updateToolMetadata: (metadata: ToolMetadata) => void;

  // execution result
  toolResult: object | null;
  setToolResult: (toolResult: object | null) => void;
  // reset counter for updating tool code
  resetCounter: number;
  setResetCounter: (resetCounter: number | ((prev: number) => number)) => void;

  xShinkaiAppId: string;
  xShinkaiToolId: string;

  focusedPanel: 'code' | 'metadata' | 'console' | 'preview' | null;
  setFocusedPanel: (
    focusedPanel: 'code' | 'metadata' | 'console' | 'preview' | null,
  ) => void;

  resetPlaygroundStore: () => void;

  metadataEditorRef: React.MutableRefObject<PrismEditor | null>;
  codeEditorRef: React.MutableRefObject<PrismEditor | null>;

  toolHomepageScrollPositionRef: React.MutableRefObject<{
    [key: string]: number;
  } | null>;

  selectedToolCategory: GetToolsCategory | 'all';
  setSelectedToolCategory: (
    selectedToolCategory: GetToolsCategory | 'all',
  ) => void;
};

export const toolHomepageScrollPositionRef = createRef<{
  [key: string]: number;
}>() as React.MutableRefObject<{
  [key: string]: number;
}>;
toolHomepageScrollPositionRef.current = {};

const createPlaygroundStore = () => {
  return createStore<PlaygroundStore>((set) => ({
    // inboxId
    chatInboxId: undefined,
    setChatInboxId: (chatInboxId) => set({ chatInboxId }),
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
    updateToolMetadata: (toolMetadata) =>
      set((state) => ({
        toolMetadata,
        toolMetadataStatus: 'success',
        toolMetadataError: null,
      })),
    // execution result
    toolResult: null,
    setToolResult: (toolResult) => set({ toolResult }),
    // reset counter for updating tool code
    resetCounter: 0,
    setResetCounter: (resetCounter) =>
      set((state) => ({
        resetCounter:
          typeof resetCounter === 'function'
            ? resetCounter(state.resetCounter)
            : resetCounter,
      })),

    xShinkaiAppId: `app-id-${Date.now()}`,
    xShinkaiToolId: `task-id-${Date.now()}`,

    focusedPanel: 'code',
    setFocusedPanel: (focusedPanel) => set({ focusedPanel }),

    toolHomepageScrollPositionRef,
    selectedToolCategory: 'all',
    setSelectedToolCategory: (selectedToolCategory) =>
      set({ selectedToolCategory }),

    metadataEditorRef: createRef<PrismEditor>(),
    codeEditorRef: createRef<PrismEditor>(),

    resetPlaygroundStore: () =>
      set({
        chatInboxId: undefined,
        toolCodeStatus: 'idle',
        toolCode: '',
        toolCodeError: null,
        toolMetadataStatus: 'idle',
        toolMetadata: null,
        toolMetadataError: null,
        toolResult: null,
        resetCounter: 0,
        focusedPanel: 'code',
        xShinkaiAppId: `app-id-${Date.now()}`,
        xShinkaiToolId: `task-id-${Date.now()}`,
        selectedToolCategory: 'all',
      }),
  }));
};

const PlaygroundContext = createContext<ReturnType<
  typeof createPlaygroundStore
> | null>(null);

export const PlaygroundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const [store] = useState<ReturnType<typeof createPlaygroundStore>>(
    createPlaygroundStore(),
  );

  useEffect(() => {
    if (location.pathname.startsWith('/tools/edit/')) {
      return;
    }

    store.getState().resetPlaygroundStore();
  }, [location, location.pathname, store]);

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
