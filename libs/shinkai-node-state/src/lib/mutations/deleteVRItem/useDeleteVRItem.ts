import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { deleteVRItem } from './index';
import { DeleteVRItemInput, DeleteVRItemOutput } from './types';

type Options = UseMutationOptions<DeleteVRItemOutput, Error, DeleteVRItemInput>;

export const useDeleteVRItem = (options?: Options) => {
  return useMutation({
    mutationFn: deleteVRItem,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_VR_FILES],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
