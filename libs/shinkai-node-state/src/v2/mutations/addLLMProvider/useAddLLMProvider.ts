import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { addLLMProvider } from '.';
import { AddLLMProviderInput, AddLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  AddLLMProviderOutput,
  APIError,
  AddLLMProviderInput
>;

export const useAddLLMProvider = (options?: Options) => {
  return useMutation({
    mutationFn: addLLMProvider,
    ...options,
  });
};
