import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { unshareFolder } from './index';
import { UnshareFolderInput, UnshareFolderOutput } from './types';

type Options = UseMutationOptions<
  UnshareFolderOutput,
  Error,
  UnshareFolderInput
>;

export const useUnshareFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unshareFolder,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_MY_SHARED_FOLDERS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
