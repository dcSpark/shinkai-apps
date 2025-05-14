import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { scanOllamaModels } from '.';
import { ScanOllamaModelsInput, ScanOllamaModelsOutput } from './types';

type UseScanOllamaModels = [
  FunctionKeyV2.SCAN_OLLAMA_MODELS,
  ScanOllamaModelsInput,
];

type Options = QueryObserverOptions<
  ScanOllamaModelsOutput,
  Error,
  ScanOllamaModelsOutput,
  ScanOllamaModelsOutput,
  UseScanOllamaModels
>;

export const useScanOllamaModels = (
  input: ScanOllamaModelsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.SCAN_OLLAMA_MODELS, input],
    queryFn: async () => scanOllamaModels(input),
    ...options,
  });
  return response;
};
