import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import {
  type UpdateChatConfigInput,
  type UpdateChatConfigOutput,
} from './types';
import { updateJobScope } from './index';

type Options = UseMutationOptions<
  UpdateChatConfigOutput,
  APIError,
  UpdateChatConfigInput
>;

export const useUpdateJobScope = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateJobScope,
    ...options,
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_JOB_SCOPE,
          {
            jobId: variables.jobId,
            nodeAddress: variables.nodeAddress,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
