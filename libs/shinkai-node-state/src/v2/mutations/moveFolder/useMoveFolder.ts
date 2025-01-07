import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { moveFolder } from './index';
import { MoveFolderOutput, MoveVRFolderInput } from './types';

type Options = UseMutationOptions<
  MoveFolderOutput,
  APIError,
  MoveVRFolderInput
>;

export const useMoveFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveFolder,
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
