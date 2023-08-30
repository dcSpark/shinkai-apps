import { addOllamaModels } from '@shinkai_network/shinkai-message-ts/api';
import { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type AddOllamaModelsInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  senderSubidentity: string;
  shinkaiIdentity: string;
  payload: { models: string[] };
};

export const useAddOllamaModels = (
  options?: UseMutationOptions<void, Error, AddOllamaModelsInput>,
) => {
  const queryClient = useQueryClient();
  const response = useMutation({
    mutationFn: (value): Promise<void> => {
      const {
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        payload,
        ...credentials
      } = value;
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
