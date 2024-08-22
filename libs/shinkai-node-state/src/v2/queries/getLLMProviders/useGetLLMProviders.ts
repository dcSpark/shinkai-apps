import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getLLMProviders } from '.';
import type { GetLLMProvidersInput } from './types';

export const useGetLLMProviders = (input: GetLLMProvidersInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_AGENTS, input],
    queryFn: () => getLLMProviders(input),
  });
  return { ...response, llmProviders: response.data ?? [] };
};
