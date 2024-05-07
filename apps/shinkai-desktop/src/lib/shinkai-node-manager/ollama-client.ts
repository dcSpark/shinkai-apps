import { queryClient as shinkaiNodeStateQueryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import {
  QueryClient,
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  Config as OllamaConfig,
  ListResponse,
  Ollama,
  ProgressResponse,
  StatusResponse,
} from 'ollama';

import { OLLAMA_MODELS } from './ollama_models';

// Client
export const queryClient = new QueryClient();

// Queries
export const useOllamaListQuery = (
  ollamaConfig: OllamaConfig,
  options?: QueryObserverOptions,
): UseQueryResult<ListResponse, Error> => {
  const query = useQuery({
    queryKey: ['ollama_list'],
    queryFn: async (): Promise<ListResponse> => {
      const ollamaClient = new Ollama(ollamaConfig);
      const response = await ollamaClient.list();
      return response;
    },
    ...options,
  });
  return { ...query } as UseQueryResult<ListResponse, Error>;
};

// Mutations
export const useOllamaPullMutation = (
  input: { model: (typeof OLLAMA_MODELS)[0]['model'] },
  ollamaConfig: OllamaConfig,
  options?: UseMutationOptions<
    AsyncGenerator<ProgressResponse, unknown, unknown>,
    Error,
    void
  >,
) => {
  const response = useMutation({
    mutationFn: async (): Promise<
      AsyncGenerator<ProgressResponse, unknown, unknown>
    > => {
      const ollamaClient = new Ollama(ollamaConfig);
      const response = await ollamaClient.pull({
        model: input.model,
        stream: true,
      });
      return response;
    },
    onSuccess: (...onSuccessParameters) => {
      shinkaiNodeStateQueryClient.invalidateQueries({
        queryKey: [FunctionKey.SCAN_OLLAMA_MODELS],
      });
      queryClient.invalidateQueries({
        queryKey: ['shinkai_node_set_default_options'],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
    ...options,
  });
  return { ...response };
};

export const useOllamaRemoveMutation = (
  input: { model: (typeof OLLAMA_MODELS)[0]['model'] },
  ollamaConfig: OllamaConfig,
  options?: UseMutationOptions<StatusResponse, Error, void>,
) => {
  const response = useMutation({
    mutationFn: async (): Promise<StatusResponse> => {
      const ollamaClient = new Ollama(ollamaConfig);
      const response = await ollamaClient.delete({
        model: input.model,
      });
      return response;
    },
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['ollama_list'],
      });
      shinkaiNodeStateQueryClient.invalidateQueries({
        queryKey: [FunctionKey.SCAN_OLLAMA_MODELS],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
    ...options,
  });
  return { ...response };
};
