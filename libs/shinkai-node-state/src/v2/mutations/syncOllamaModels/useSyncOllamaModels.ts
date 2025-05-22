import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { syncOllamaModels } from '.';
import { SyncOllamaModelsInput, SyncOllamaModelsOutput } from './types';

type Options = UseMutationOptions<
  SyncOllamaModelsOutput,
  Error,
  SyncOllamaModelsInput
>;

export const useSyncOllamaModels = (options?: Options) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: syncOllamaModels,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
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
