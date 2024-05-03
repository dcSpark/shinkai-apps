import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { deleteAgent } from './index';
import { DeleteAgentInput, DeleteAgentOutput } from './types';

type Options = UseMutationOptions<DeleteAgentOutput, Error, DeleteAgentInput>;

export const useDeleteAgent = (options?: Options) => {
  return useMutation({
    mutationFn: deleteAgent,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_AGENTS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
