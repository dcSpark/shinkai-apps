import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getLLMProviders } from '.';
import type { GetLLMProvidersInput } from './types';

export const useGetLLMProviders = (input: GetLLMProvidersInput) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_AGENTS, input],
    queryFn: () => getLLMProviders(input),
  });
  return { ...response, llmProviders: response.data ?? [] };
};
