import {
  MutationObserverOptions,
  QueryClient,
  QueryObserverOptions,
  useMutation,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export type ShinkaiNodeOptions = {
  port: number;
  unstructured_server_url: string;
  embeddings_server_url: string;
  first_device_needs_registration_code: string;
  initial_agent_names: string;
  initial_agent_urls: string;
  initial_agent_models: string;
  initial_agent_api_keys: string;
  starting_num_qr_devices: number;
};

// Client
export const queryClient = new QueryClient();

// Queries
export const useShinkaiNodeIsRunningQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<boolean, Error> => {
  const query = useQuery({
    queryKey: ['shinkai_node_is_running'],
    queryFn: (): Promise<boolean> => invoke('shinkai_node_is_running'),
    ...options,
  });
  return { ...query } as UseQueryResult<boolean, Error>;
};
export const useShinkaiNodeGetLastNLogsQuery = (
  input: { length: number },
  options?: QueryObserverOptions,
): UseQueryResult<string[], Error> => {
  const query = useQuery({
    queryKey: ['shinkai_node_get_last_n_logs'],
    queryFn: (): Promise<string[]> =>
      invoke('shinkai_node_get_last_n_logs', { length: input.length }),
    ...options,
  });
  return { ...query } as UseQueryResult<string[], Error>;
};
export const useShinkaiNodeGetOptionsQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<ShinkaiNodeOptions, Error> => {
  const query = useQuery({
    queryKey: ['shinkai_node_get_options'],
    queryFn: (): Promise<ShinkaiNodeOptions> =>
      invoke('shinkai_node_get_options'),
    ...options,
  });
  return { ...query } as UseQueryResult<ShinkaiNodeOptions, Error>;
};

// Mutations
export const useShinkaiNodeSpawnMutation = (
  options?: MutationObserverOptions,
) => {
  const response = useMutation({
    mutationFn: () => {
      return invoke('shinkai_node_spawn');
    },
    ...options,
  });
  return { ...response };
};

export const useShinkaiNodeKillMutation = (
  options?: MutationObserverOptions,
) => {
  const response = useMutation({
    mutationFn: () => {
      return invoke('shinkai_node_kill');
    },
    ...options,
  });
  return { ...response };
};
