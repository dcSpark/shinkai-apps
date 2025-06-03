import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import {
  type SetMaxChatIterationsInput,
  type SetMaxChatIterationsOutput,
} from './types';
import { setMaxChatIterations } from '.';

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
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_PREFERENCES],
      });
      if (onOptionsSuccess) {
        onOptionsSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
