import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ChatMessagesStore = {
  messages: Record<string, string>;
  addMessage: (inboxId: string, content: string) => void;
  getMessage: (inboxId: string) => string | undefined;
  clearMessages: () => void;
};

export const useChatMessagesStore = create<ChatMessagesStore>()(
  devtools(
    (set, get) => ({
      messages: {},
      
      addMessage: (inboxId: string, content: string) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [inboxId]: content,
          },
        }));
      },
      
      getMessage: (inboxId: string) => {
        return get().messages[inboxId];
      },
      
      clearMessages: () => {
        set({ messages: {} });
      },
    }),
  ),
);
