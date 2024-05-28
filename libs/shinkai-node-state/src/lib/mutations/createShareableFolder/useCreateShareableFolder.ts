import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { createShareableFolder } from './index';
import {
  CreateShareableFolderInput,
  CreateShareableFolderOutput,
} from './types';

type Options = UseMutationOptions<
  CreateShareableFolderOutput,
  Error,
  CreateShareableFolderInput
>;

export const useCreateShareableFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShareableFolder,
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
