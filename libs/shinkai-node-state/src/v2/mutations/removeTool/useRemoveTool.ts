import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeTool } from './index';
import { RemoveToolInput, RemoveToolOutput } from './types';

type Options = UseMutationOptions<RemoveToolOutput, APIError, RemoveToolInput>;

export const useRemoveTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTool,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_PLAYGROUND_TOOLS,
          {
            nodeAddress: variables.nodeAddress,
            token: variables.token,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
