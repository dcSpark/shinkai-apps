import { createContext, useContext, useState } from 'react';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

type ChatStore = {
  showArtifactPanel: boolean;
  toggleArtifactPanel: () => void;
};

const createChatStore = () =>
  createStore<ChatStore>((set) => ({
    showArtifactPanel: true,
    toggleArtifactPanel: () =>
      set((state) => ({ showArtifactPanel: !state.showArtifactPanel })),
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
