import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { subscribeToSharedFolder } from './index';
import {
  SubscribeToSharedFolderInput,
  SubscribeToSharedFolderOutput,
} from './types';

type Options = UseMutationOptions<
  SubscribeToSharedFolderOutput,
  Error,
  SubscribeToSharedFolderInput
>;

export const useSubscribeToSharedFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscribeToSharedFolder,
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
