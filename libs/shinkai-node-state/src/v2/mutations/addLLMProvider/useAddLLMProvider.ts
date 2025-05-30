import  { type UseMutationOptions, useMutation  } from '@tanstack/react-query';

import { type APIError } from '../../types';
import { type AddLLMProviderInput, type AddLLMProviderOutput } from './types';
import { addLLMProvider } from '.';

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
