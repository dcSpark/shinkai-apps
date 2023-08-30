import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { deleteVRFolder } from './index';
import { DeleteVRFolderInput, DeleteVRFolderOutput } from './types';

type Options = UseMutationOptions<
  DeleteVRFolderOutput,
  Error,
  DeleteVRFolderInput
>;

export const useDeleteVrFolder = (options?: Options) => {
  const queryClient = useQueryClient();
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
