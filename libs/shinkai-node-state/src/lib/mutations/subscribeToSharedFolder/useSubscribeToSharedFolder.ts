import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
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
