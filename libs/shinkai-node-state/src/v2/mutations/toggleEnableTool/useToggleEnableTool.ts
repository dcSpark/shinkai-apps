import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { toggleEnableTool } from './index';
import { ToggleEnableToolInput, ToggleEnableToolOutput } from './types';

type Options = UseMutationOptions<
  ToggleEnableToolOutput,
  APIError,
  ToggleEnableToolInput
>;

export const useToggleEnableTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleEnableTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_SEARCH_TOOLS],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
