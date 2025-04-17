import { Artifact } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { createContext, useContext, useState } from 'react';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

export type ToolView = 'form' | 'raw';

type ChatStore = {
  selectedArtifact: Artifact | null;
  setSelectedArtifact: (selectedArtifact: Artifact | null) => void;
  // tool preview (form or raw)
  chatToolView: ToolView;
  setChatToolView: (chatToolView: ToolView) => void;
  toolRawInput: string;
  setToolRawInput: (toolRawInput: string) => void;
};

const createChatStore = () =>
  createStore<ChatStore>((set) => ({
    selectedArtifact: null,
    setSelectedArtifact: (selectedArtifact: Artifact | null) =>
      set({ selectedArtifact }),

    chatToolView: 'form',
    setChatToolView: (chatToolView: ToolView) => set({ chatToolView }),

    toolRawInput: '',
    setToolRawInput: (toolRawInput: string) => set({ toolRawInput }),
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
