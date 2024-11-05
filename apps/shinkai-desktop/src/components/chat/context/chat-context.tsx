import { createContext, useContext, useState } from 'react';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

export type Artifact = {
  identifier: string;
  type: string;
  title: string;
  code: string;
  language?: string;
};

type ChatStore = {
  showArtifactPanel: boolean;
  toggleArtifactPanel: () => void;
  artifactCode: string;
  setArtifactCode: (code: string) => void;
  artifact: Artifact | null;
  setArtifact: (artifact: Artifact | null) => void;
  artifacts: Artifact[];
  setArtifacts: (artifacts: Artifact[]) => void;
};

const createChatStore = () =>
  createStore<ChatStore>((set) => ({
    showArtifactPanel: false,
    toggleArtifactPanel: () =>
      set((state) => ({ showArtifactPanel: !state.showArtifactPanel })),

    artifact: null,
    setArtifact: (artifact: Artifact | null) => set({ artifact }),
    artifactCode: '',

    artifacts: [],
    setArtifacts: (artifacts: Artifact[]) => set({ artifacts }),

    setArtifactCode: (code: string) => set({ artifactCode: code }),
  }));

const ChatContext = createContext<ReturnType<typeof createChatStore> | null>(
  null,
);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] =
    useState<ReturnType<typeof createChatStore>>(createChatStore());

  return <ChatContext.Provider value={store}>{children}</ChatContext.Provider>;
};

export function useChatStore<T>(selector: (state: ChatStore) => T) {
  const store = useContext(ChatContext);
  if (!store) {
    throw new Error('Missing ChatProvider');
  }
  const value = useStore(store, selector);
  return value;
}
