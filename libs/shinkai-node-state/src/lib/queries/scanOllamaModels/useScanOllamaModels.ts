import { scanOllamaModels } from '@shinkai_network/shinkai-message-ts/api/ollama';
import {
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type ScanOllamaModelsInput = {
  nodeAddress: string;
  token: string;
};

export type ScanOllamaModelsResponse = Awaited<
  ReturnType<typeof scanOllamaModels>
>;

export const useScanOllamaModels = (
  input: ScanOllamaModelsInput,
  options?: Omit<QueryObserverOptions, 'queryKey' | 'queryFn'>,
): UseQueryResult<ScanOllamaModelsResponse, Error> => {
  const query = useQuery({
    queryKey: [FunctionKey.SCAN_OLLAMA_MODELS, input],
    queryFn: async () => {
      const { nodeAddress, token } = input;
      const response = await scanOllamaModels(nodeAddress, token);

      // TODO: temporary fix until shinkai node is updated
      const uniqueModels = response.filter(
        (model, index, self) =>
          index === self.findIndex((t) => t.model === model.model),
      );

      return uniqueModels;
    },
    ...options,
  });
  return { ...query } as UseQueryResult<ScanOllamaModelsResponse, Error>;
};
