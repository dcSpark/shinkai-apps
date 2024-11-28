import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { createToolMetadata } from '.';
import { CreateToolMetadataInput, CreateToolMetadataOutput } from './types';

type Options = UseMutationOptions<
  CreateToolMetadataOutput,
  APIError,
  CreateToolMetadataInput
>;

export const useCreateToolMetadata = (options?: Options) => {
  return useMutation({
    mutationFn: createToolMetadata,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
