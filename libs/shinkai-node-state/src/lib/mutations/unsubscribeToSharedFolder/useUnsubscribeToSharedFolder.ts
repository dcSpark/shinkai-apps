import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
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
  return useMutation({
    mutationFn: unsubscribeToSharedFolder,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_AVAILABLE_SHARED_ITEMS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
