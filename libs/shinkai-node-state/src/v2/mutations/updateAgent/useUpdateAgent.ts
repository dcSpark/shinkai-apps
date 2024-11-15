import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateAgent } from './index';
import { UpdateAgentInput, UpdateAgentOutput } from './types';

type Options = UseMutationOptions<
  UpdateAgentOutput,
  APIError,
  UpdateAgentInput
>;

export const useUpdateAgent = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAgent,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_AGENTS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
