import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeJob } from './index';
import { RemoveJobInput, RemoveJobOutput } from './types';

type Options = UseMutationOptions<RemoveJobOutput, APIError, RemoveJobInput>;

export const useRemoveJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_INBOXES_WITH_PAGINATION,
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
