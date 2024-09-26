import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { removeLLMProvider } from '.';
import { RemoveLLMProviderInput, RemoveLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  RemoveLLMProviderOutput,
  APIError,
  RemoveLLMProviderInput
>;

export const useRemoveLLMProvider = (options?: Options) => {
  return useMutation({
    mutationFn: removeLLMProvider,
    ...options,
  });
};
