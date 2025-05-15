import { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { updateNodeName } from '.';
import { UpdateNodeNameInput, UpdateNodeNameOutput } from './types';

type Options = UseMutationOptions<
  UpdateNodeNameOutput,
  APIError,
  UpdateNodeNameInput
>;

export const useUpdateNodeName = (options?: Options) => {
  return useMutation({
    mutationFn: updateNodeName,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
