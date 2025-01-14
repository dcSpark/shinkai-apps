import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { testLLMProvider } from '.';
import { TestLLMProviderInput, TestLLMProviderOutput } from './types';

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
