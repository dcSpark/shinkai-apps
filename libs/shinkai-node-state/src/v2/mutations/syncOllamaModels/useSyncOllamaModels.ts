import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type SyncOllamaModelsInput,
  type SyncOllamaModelsOutput,
} from './types';
import { syncOllamaModels } from '.';

type Options = UseMutationOptions<
  SyncOllamaModelsOutput,
  Error,
  SyncOllamaModelsInput
>;

export const useSyncOllamaModels = (options?: Options) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: syncOllamaModels,
    onSuccess: async (...onSuccessParameters) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.SCAN_OLLAMA_MODELS],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
    ...options,
  });
  return response;
};
