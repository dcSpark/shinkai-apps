import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { addLLMProvider } from '.';
import { AddLLMProviderInput } from './types';

type Options = UseMutationOptions<unknown, Error, AddLLMProviderInput>;

export const useAddLLMProvider = (options?: Options) => {
  return useMutation({
    mutationFn: addLLMProvider,
    ...options,
  });
};
