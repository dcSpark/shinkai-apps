import  { type UseMutationOptions, useMutation  } from '@tanstack/react-query';

import { type APIError } from '../../types';
import { type TestLLMProviderInput, type TestLLMProviderOutput } from './types';
import { testLLMProvider } from '.';

type Options = UseMutationOptions<
  TestLLMProviderOutput,
  APIError,
  TestLLMProviderInput
>;

export const useTestLLMProvider = (options?: Options) => {
  return useMutation({
    mutationFn: testLLMProvider,
    ...options,
  });
};
