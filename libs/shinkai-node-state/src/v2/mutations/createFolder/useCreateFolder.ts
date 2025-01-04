import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { createFolder } from '.';
import { CreateFolderInput, CreateFolderOutput } from './types';

type Options = UseMutationOptions<CreateFolderOutput, Error, CreateFolderInput>;

export const useCreateFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
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
