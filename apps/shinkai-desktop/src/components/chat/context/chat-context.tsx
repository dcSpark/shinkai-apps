import { createContext, useContext, useState } from 'react';
import { createStore } from 'zustand';
import { useStore } from 'zustand/index';

type ChatStore = {
  showArtifactPanel: boolean;
  toggleArtifactPanel: () => void;
  artifactCode: string;
  setArtifactCode: (code: string) => void;
};

const createChatStore = () =>
  createStore<ChatStore>((set) => ({
    showArtifactPanel: true,
    toggleArtifactPanel: () =>
      set((state) => ({ showArtifactPanel: !state.showArtifactPanel })),
    // remove it later
    artifactCode: `
     import React from 'react';
import { BarChart, Bar } from 'recharts';

const Chart = () => {
  const data = [
    { name: 'Java', value: 10 },
    { name: 'Python', value: 20 },
    { name: 'JavaScript', value: 30 },
    { name: 'C++', value: 15 },
    { name: 'Ruby', value: 5 },
  ];

  return (
    <div>
      <BarChart width={400} height={300}>
        <Bar dataKey="value" fill="#8884d8">
          {data.map((entry, index) => (
            <Bar key={\`bar-\${index}\`} name={entry.name} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
};

export default Chart;
    `,
    // artifactCode: '',
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
