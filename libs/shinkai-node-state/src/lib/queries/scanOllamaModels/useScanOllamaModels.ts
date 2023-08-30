import { scanOllamaModels } from '@shinkai_network/shinkai-message-ts/api';
import { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type ScanOllamaModelsInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  senderSubidentity: string;
  shinkaiIdentity: string;
};

export type ScanOllamaModelsResponse = Awaited<ReturnType<typeof scanOllamaModels>>;

export const useScanOllamaModels = (
  input: ScanOllamaModelsInput,
  options?: QueryObserverOptions,
): UseQueryResult<ScanOllamaModelsResponse, Error> => {
  const query = useQuery({
    queryKey: [FunctionKey.SCAN_OLLAMA_MODELS, input],
    queryFn: async () => {
      const {
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        ...credentials
      } = input;
      const response = await scanOllamaModels(
        nodeAddress,
        senderSubidentity,
        shinkaiIdentity,
        credentials,
      );
      return response;
    },
    ...options,
  });
  return { ...query } as UseQueryResult<ScanOllamaModelsResponse, Error>;
};
