import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateTool } from './index';
import { UpdateToolInput, UpdateToolOutput } from './types';

type Options = UseMutationOptions<UpdateToolOutput, APIError, UpdateToolInput>;

export const useUpdateTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_TOOL,
          {
            toolKey: variables.toolKey,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
