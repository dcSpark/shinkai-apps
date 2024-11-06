import { Artifact } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { createContext, useContext, useState } from 'react';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

type ChatStore = {
  artifact: Artifact | null;
  setArtifact: (artifact: Artifact | null) => void;
  artifacts: Artifact[];
  setArtifacts: (artifacts: Artifact[]) => void;
};

const createChatStore = () =>
  createStore<ChatStore>((set) => ({
    artifact: null,
    setArtifact: (artifact: Artifact | null) => set({ artifact }),
    artifacts: [],
    setArtifacts: (artifacts: Artifact[]) => set({ artifacts }),
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
