import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { updateTool } from './index';
import { UpdateToolInput, UpdateToolOutput } from './types';

type Options = UseMutationOptions<UpdateToolOutput, Error, UpdateToolInput>;

export const useUpdateTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_LIST_TOOLS],
      });
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKey.GET_TOOL,
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
