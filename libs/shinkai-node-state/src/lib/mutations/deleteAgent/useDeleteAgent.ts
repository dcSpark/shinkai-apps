import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { deleteAgent } from './index';
import { DeleteAgentInput, DeleteAgentOutput } from './types';

type Options = UseMutationOptions<DeleteAgentOutput, Error, DeleteAgentInput>;

export const useDeleteAgent = (options?: Options) => {
  const queryClient = useQueryClient();
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
