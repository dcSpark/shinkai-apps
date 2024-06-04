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

      const pipeGenerator = async function* transformGenerator(
        generator: AsyncGenerator<ProgressResponse, unknown, unknown>,
      ) {
        for await (const progress of generator) {
          if (progress.status === 'success') {
            console.log(`completed invalidating`);
            queryClient.invalidateQueries({
              queryKey: ['ollama_list'],
            });
          }
          yield progress;
        }
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
        queryKey: ['shinkai_node_set_default_options'],
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
      return response;
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: ['ollama_list'],
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
