import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { setCommonToolsetConfig } from '.';
import { SetCommonToolsetConfigInput, SetCommonToolsetConfigOutput } from './types';

type Options = UseMutationOptions<
  SetCommonToolsetConfigOutput,
  APIError,
  SetCommonToolsetConfigInput
>;

export const useSetCommonToolsetConfig = (options?: Options) => {
  const { onSuccess: onOptionsSuccess, ...restOptions } = options || {};
  return useMutation({
    mutationFn: setCommonToolsetConfig,
    onSuccess: (data, variables, context) => {
      if (onOptionsSuccess) {
        onOptionsSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
