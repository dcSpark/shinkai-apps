import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateJobScope } from './index';
import { UpdateChatConfigInput, UpdateChatConfigOutput } from './types';

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
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
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
