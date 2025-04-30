import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { setMaxChatIterations } from '.';
import { SetMaxChatIterationsInput, SetMaxChatIterationsOutput } from './types';

type Options = UseMutationOptions<
  SetMaxChatIterationsOutput,
  APIError,
  SetMaxChatIterationsInput
>;

export const useSetMaxChatIterations = (options?: Options) => {
  const queryClient = useQueryClient();
  const { onSuccess: onOptionsSuccess, ...restOptions } = options || {};
  return useMutation({
    mutationFn: setMaxChatIterations,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [FunctionKeyV2.GET_PREFERENCES] });
      if (onOptionsSuccess) {
        onOptionsSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
