import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { copyVRFolder } from './index';
import { CopyVRFolderInput, CopyVRFolderOutput } from './types';

type Options = UseMutationOptions<CopyVRFolderOutput, Error, CopyVRFolderInput>;

export const useCopyVrFolder = (options?: Options) => {
  return useMutation({
    mutationFn: copyVRFolder,
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
