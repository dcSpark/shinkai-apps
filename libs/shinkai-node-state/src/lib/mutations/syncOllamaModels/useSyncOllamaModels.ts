import {
  addOllamaModels,
  scanOllamaModels,
} from '@shinkai_network/shinkai-message-ts/api/ollama';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type SyncOllamaModelsInput = {
  nodeAddress: string;
  token: string;
};

export const useSyncOllamaModels = (
  allowedModels: string[],
  options?: UseMutationOptions<void, Error, SyncOllamaModelsInput>,
) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (value): Promise<void> => {
      const { nodeAddress, token } = value;
      let ollamaModels = await scanOllamaModels(nodeAddress, token);
      if (!ollamaModels?.length) {
        return;
      }
      if (allowedModels?.length) {
        ollamaModels = ollamaModels.filter((model) =>
          allowedModels.includes(model.model),
        );
      }
      const payload = {
        models: ollamaModels.map((v) => v.model),
      };
      return addOllamaModels(nodeAddress, token, payload);
    },
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
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
