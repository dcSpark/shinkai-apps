import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { createToolCode } from '.';
import { CreateToolCodeInput, CreateToolCodeOutput } from './types';

type Options = UseMutationOptions<
  CreateToolCodeOutput,
  APIError,
  CreateToolCodeInput
>;

export const useCreateToolCode = (options?: Options) => {
  return useMutation({
    mutationFn: createToolCode,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};