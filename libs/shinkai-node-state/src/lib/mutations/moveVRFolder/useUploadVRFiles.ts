import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { moveVRFolder } from './index';
import { MoveVRFolderInput, MoveVRFolderOutput } from './types';

type Options = UseMutationOptions<MoveVRFolderOutput, Error, MoveVRFolderInput>;

export const useMoveVrFolder = (options?: Options) => {
  return useMutation({
    mutationFn: moveVRFolder,
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
