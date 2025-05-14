import { addOllamaModels } from '@shinkai_network/shinkai-message-ts/api/ollama';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type AddOllamaModelsInput = {
  nodeAddress: string;
  token: string;
  payload: { models: string[] };
};

export const useAddOllamaModels = (
  options?: UseMutationOptions<void, Error, AddOllamaModelsInput>,
) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: (value): Promise<void> => {
      const { nodeAddress, token, payload } = value;
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
