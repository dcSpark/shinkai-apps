import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type StreamingResponseState = {
  streamingResponses: Map<string, string>;
  setStreamingResponse: (inboxId: string, content: string) => void;
  appendStreamingResponse: (inboxId: string, chunk: string) => void;
  removeStreamingResponse: (inboxId: string) => void;
  getStreamingResponse: (inboxId: string) => string | undefined;
};

export const useStreamingResponseStore = create<StreamingResponseState>()(
  devtools(
    (set, get) => ({
      streamingResponses: new Map(),

      setStreamingResponse: (inboxId, content) => {
        set((state) => ({
          streamingResponses: new Map(state.streamingResponses).set(inboxId, content),
        }));
      },

      appendStreamingResponse: (inboxId, chunk) => {
        set((state) => {
          const currentContent = state.streamingResponses.get(inboxId) || '';
          return {
            streamingResponses: new Map(state.streamingResponses).set(
              inboxId,
              currentContent + chunk,
            ),
          };
        });
      },

      removeStreamingResponse: (inboxId) => {
        set((state) => {
          const newMap = new Map(state.streamingResponses);
          newMap.delete(inboxId);
          return {
            streamingResponses: newMap,
          };
        });
      },

      getStreamingResponse: (inboxId: string) => {
        return get().streamingResponses.get(inboxId);
      },
    }),
    {
      name: 'streaming-response-store',
    },
  ),
);
