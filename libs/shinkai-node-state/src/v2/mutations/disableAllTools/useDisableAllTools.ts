import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { disableAllTools } from '.';
import { DisableAllToolsInput, DisableAllToolsOutput } from './types';

type Options = UseMutationOptions<
  DisableAllToolsOutput,
  APIError,
  DisableAllToolsInput
>;

export const useDisableAllTools = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableAllTools,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
