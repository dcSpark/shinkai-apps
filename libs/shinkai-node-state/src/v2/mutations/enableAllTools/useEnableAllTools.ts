import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { enableAllTools } from '.';
import { EnableAllToolsInput, EnableAllToolsOutput } from './types';

type Options = UseMutationOptions<
  EnableAllToolsOutput,
  APIError,
  EnableAllToolsInput
>;

export const useEnableAllTools = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enableAllTools,
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
