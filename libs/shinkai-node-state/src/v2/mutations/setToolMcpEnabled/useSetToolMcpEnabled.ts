import {
  MutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { setToolMcpEnabled } from './index';
import { SetToolMcpEnabledInput, SetToolMcpEnabledOutput } from './types';

type Options = MutationOptions<
  SetToolMcpEnabledOutput,
  APIError,
  SetToolMcpEnabledInput
>;

export const useSetToolMcpEnabled = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setToolMcpEnabled,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });

      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_SEARCH_TOOLS],
      });

      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_TOOL,
          {
            toolKey: variables.toolRouterKey,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
};
