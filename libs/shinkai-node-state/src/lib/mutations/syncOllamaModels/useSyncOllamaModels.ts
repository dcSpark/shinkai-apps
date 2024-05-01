import { addOllamaModels, scanOllamaModels } from "@shinkai_network/shinkai-message-ts/api";
import { CredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";
import { useMutation,UseMutationOptions } from "@tanstack/react-query";

import { FunctionKey, queryClient } from "../../constants";

export type SyncOllamaModelsInput = CredentialsPayload & {
    nodeAddress: string;
    sender: string;
    senderSubidentity: string;
    shinkaiIdentity: string;
};

export const useSyncOllamaModels = (
  options?: UseMutationOptions<void, Error, SyncOllamaModelsInput>,
) => {
  const response = useMutation({
    mutationFn: async (value): Promise<void> => {
      const {
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        ...credentials
      } = value;
      const ollamaModels = await scanOllamaModels(nodeAddress, senderSubidentity, shinkaiIdentity, credentials);
      if (!ollamaModels?.length) {
        return;
      }
      const payload = {
        models: ollamaModels.map(v => v.model),
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
