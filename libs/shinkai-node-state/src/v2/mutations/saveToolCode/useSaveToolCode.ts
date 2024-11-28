import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { saveToolCode } from '.';
import { SaveToolCodeInput, SaveToolCodeOutput } from './types';

type Options = UseMutationOptions<
  SaveToolCodeOutput,
  APIError,
  SaveToolCodeInput
>;

export const useSaveToolCode = (options?: Options) => {
  return useMutation({
    mutationFn: saveToolCode,
    ...options,
    onSuccess: (response, variables, context) => {
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
