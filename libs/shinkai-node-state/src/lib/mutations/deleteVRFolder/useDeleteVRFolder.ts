import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { deleteVRFolder } from './index';
import { DeleteVRFolderInput, DeleteVRFolderOutput } from './types';

type Options = UseMutationOptions<
  DeleteVRFolderOutput,
  Error,
  DeleteVRFolderInput
>;

export const useDeleteVrFolder = (options?: Options) => {
  return useMutation({
    mutationFn: deleteVRFolder,
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
