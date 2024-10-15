import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import {
  QueryObserverOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  Config as OllamaConfig,
  ListResponse,
  Ollama,
  ProgressResponse,
  StatusResponse,
} from 'ollama/browser';

const removeForbiddenHeadersInOllamaCors = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Promise<Response> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (init?.headers as any)?.['User-Agent'];
  return fetch(input, init);
};

// Queries
export const useOllamaListQuery = (
  ollamaConfig: OllamaConfig,
  options?: QueryObserverOptions,
): UseQueryResult<ListResponse, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['ollama_list'],
    queryFn: async (): Promise<ListResponse> => {
      const ollamaClient = new Ollama({
        fetch: removeForbiddenHeadersInOllamaCors,
        ...ollamaConfig,
      });
      const response = await ollamaClient.list();
      return response;
    },
  });
  return { ...query } as UseQueryResult<ListResponse, Error>;
};

const pullingModelsMap = new Map<string, ProgressResponse>();

export const useOllamaPullingQuery = (
  options?: QueryObserverOptions,
): UseQueryResult<Map<string, ProgressResponse>, Error> => {
  const query = useQuery({
    ...options,
    queryKey: ['ollama_pulling_models'],
    queryFn: async (): Promise<Map<string, ProgressResponse>> => {
      return pullingModelsMap;
    },
  });
  return { ...query } as UseQueryResult<Map<string, ProgressResponse>, Error>;
};

// Mutations
export const useOllamaPullMutation = (
  ollamaConfig: OllamaConfig,
  options?: UseMutationOptions<
    AsyncGenerator<ProgressResponse, unknown, unknown>,
    Error,
    { model: string }
  >,
) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (
      input,
    ): Promise<AsyncGenerator<ProgressResponse, unknown, unknown>> => {
      const ollamaClient = new Ollama(ollamaConfig);
      const pipeGenerator = async function* transformGenerator(generator: {
        [Symbol.asyncIterator](): AsyncGenerator<
          ProgressResponse,
          void,
          unknown
        >;
      }) {
        for await (const progress of generator) {
          pullingModelsMap.set(input.model, progress);
          if (progress.status === 'success') {
            queryClient.invalidateQueries({
              queryKey: ['ollama_list'],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ['ollama_pulling_models'],
          });
          yield progress;
        }
        pullingModelsMap.delete(input.model);
      };
      return ollamaClient
        .pull({
          model: input.model,
          stream: true,
        })
        .then((data) => pipeGenerator(data));
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.SCAN_OLLAMA_MODELS],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'shinkai_node_set_default_options',
          'ollama_list',
          'ollama_pulling_models',
        ],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};

export const useOllamaRemoveMutation = (
  ollamaConfig: OllamaConfig,
  options?: UseMutationOptions<StatusResponse, Error, { model: string }>,
) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (input): Promise<StatusResponse> => {
      const ollamaClient = new Ollama(ollamaConfig);
      const response = await ollamaClient.delete({
        model: input.model,
      });
      pullingModelsMap.delete(input.model);
      return response;
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['ollama_list', 'ollama_pulling_models'],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.SCAN_OLLAMA_MODELS],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};
