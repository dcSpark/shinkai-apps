import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { forkJobMessages } from './index';
import { ForkJobMessagesInput, ForkJobMessagesOutput } from './types';

type Options = UseMutationOptions<
  ForkJobMessagesOutput,
  APIError,
  ForkJobMessagesInput
>;

export const useForkJobMessages = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forkJobMessages,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_INBOXES_WITH_PAGINATION],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
