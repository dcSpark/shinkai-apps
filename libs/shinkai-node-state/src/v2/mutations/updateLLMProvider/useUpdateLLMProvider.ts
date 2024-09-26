import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { updateLLMProvider } from '.';
import { UpdateLLMProviderInput, UpdateLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  UpdateLLMProviderOutput,
  APIError,
  UpdateLLMProviderInput
>;

export const useUpdateLLMProvider = (options?: Options) => {
  return useMutation({
    mutationFn: updateLLMProvider,
    ...options,
  });
};
