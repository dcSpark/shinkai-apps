import {
  addOllamaModels,
  scanOllamaModels,
} from '@shinkai_network/shinkai-message-ts/api';
import { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type SyncOllamaModelsInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  senderSubidentity: string;
  shinkaiIdentity: string;
};

export const useSyncOllamaModels = (
  allowedModels?: string[],
  options?: UseMutationOptions<void, Error, SyncOllamaModelsInput>,
) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: async (value): Promise<void> => {
      const {
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        ...credentials
      } = value;
      let ollamaModels = await scanOllamaModels(
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        credentials,
      );
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
      return addOllamaModels(
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        credentials,
        payload,
      );
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
