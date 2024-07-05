import { create } from 'zustand';
import { devtools, persist, StorageValue } from 'zustand/middleware';

type ExperimentalStore = {
  workflowHistory: Set<string>;
  addWorkflowHistory: (id: string) => void;
  clearWorkflowHistory: () => void;
};

export const useExperimental = create<ExperimentalStore>()(
  devtools(
    persist(
      (set, get) => ({
        workflowHistory: new Set<string>(),
        addWorkflowHistory: (workflowId) => {
          console.log(workflowId, 'workflowId');
          set({
            workflowHistory: new Set(get().workflowHistory).add(workflowId),
          });
        },
        clearWorkflowHistory: () => {
          const { workflowHistory } = get();
          if (workflowHistory.size > 0) {
            set({
              workflowHistory: new Set(),
            });
          }
        },
      }),
      {
        name: 'experimental',
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                workflowHistory: new Map(state.workflowHistory),
              },
            };
          },
          setItem: (name, newValue: StorageValue<ExperimentalStore>) => {
            // functions cannot be JSON encoded
            const str = JSON.stringify({
              state: {
                ...newValue.state,
                workflowHistory: Array.from(
                  newValue.state.workflowHistory.entries(),
                ),
              },
            });
            localStorage.setItem(name, str);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      },
    ),
  ),
);
