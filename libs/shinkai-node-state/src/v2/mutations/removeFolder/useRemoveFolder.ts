import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeFolder } from './index';
import { RemoveFolderInput, RemoveFolderOutput } from './types';

type Options = UseMutationOptions<
  RemoveFolderOutput,
  APIError,
  RemoveFolderInput
>;

export const useRemoveFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFolder,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_VR_FILES],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
