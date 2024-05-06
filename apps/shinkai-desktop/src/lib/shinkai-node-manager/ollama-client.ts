import {
  QueryClient,
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

import {
  LogEntry,
  ShinkaiNodeOptions,
} from './shinkai-node-manager-client-types';

// Client
export const queryClient = new QueryClient();

// Queries
export const usePullQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<boolean, Error> => {
  const query = useQuery({
    queryKey: ['ollama_pull'],
    queryFn: (): Promise<boolean> => invoke('shinkai_node_is_running'),
    ...options,
  });
  return { ...query } as UseQueryResult<boolean, Error>;
};
