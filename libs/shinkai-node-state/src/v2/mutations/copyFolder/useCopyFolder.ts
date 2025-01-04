import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { copyFolder } from './index';
import { CopyFolderInput, CopyFolderOutput } from './types';

type Options = UseMutationOptions<CopyFolderOutput, Error, CopyFolderInput>;

export const useCopyFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: copyFolder,
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
