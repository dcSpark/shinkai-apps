import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { createVRFolder } from '.';
import { CreateVRFolderInput, CreateVRFolderOutput } from './types';

type Options = UseMutationOptions<
  CreateVRFolderOutput,
  Error,
  CreateVRFolderInput
>;

export const useCreateVRFolder = (options?: Options) => {
  return useMutation({
    mutationFn: createVRFolder,
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