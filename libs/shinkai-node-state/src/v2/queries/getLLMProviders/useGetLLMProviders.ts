import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getLLMProviders } from './index';
import { GetLLMProvidersInput, Options } from './types';

export const useGetLLMProviders = (
  input: GetLLMProvidersInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_LLM_PROVIDERS, input],
    queryFn: () => getLLMProviders(input),
    ...options,
  });
  return { ...response, llmProviders: response.data ?? [] };
};
