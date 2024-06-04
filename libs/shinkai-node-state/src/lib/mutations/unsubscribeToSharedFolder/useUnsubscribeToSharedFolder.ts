import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { unsubscribeToSharedFolder } from './index';
import {
  UnsubscribeToSharedFolderInput,
  UnsubscribeToSharedFolderOutput,
} from './types';

type Options = UseMutationOptions<
  UnsubscribeToSharedFolderOutput,
  Error,
  UnsubscribeToSharedFolderInput
>;

export const useUnsubscribeToSharedFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsubscribeToSharedFolder,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_MY_SUBSCRIPTIONS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
