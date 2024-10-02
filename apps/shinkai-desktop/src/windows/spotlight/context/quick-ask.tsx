import React, { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

type QuickAskStore = {
  inboxId: string | null;
  setInboxId: (inboxId: string | null) => void;
  messageResponse: string;
  setMessageResponse: (messageResponse: string) => void;
  isLoadingResponse: boolean;
  setLoadingResponse: (loadingResponse: boolean) => void;
};

const createQuickAskStore = () =>
  createStore<QuickAskStore>((set) => ({
    inboxId: null,
    setInboxId: (inboxId) =>
      set({
        inboxId,
      }),
    messageResponse: '',
    setMessageResponse: (messageResponse) =>
      set({
        messageResponse,
      }),
    isLoadingResponse: false,
    setLoadingResponse: (isLoadingResponse) =>
      set({
        isLoadingResponse,
      }),
  }));

const QuickAskContext = createContext<ReturnType<
  typeof createQuickAskStore
> | null>(null);

export const QuickAskProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<ReturnType<typeof createQuickAskStore>>();
  if (!storeRef.current) {
    storeRef.current = createQuickAskStore();
  }
  return (
    <QuickAskContext.Provider value={storeRef.current}>
      {children}
    </QuickAskContext.Provider>
  );
};

export function useQuickAskStore<T>(selector: (state: QuickAskStore) => T) {
  const store = useContext(QuickAskContext);
  if (!store) {
    throw new Error('Missing QuickAskProvider');
  }
  const value = useStore(store, selector);
  return value;
}
