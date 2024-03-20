import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { moveVRItem } from './index';
import { MoveVRItemInput, MoveVRItemOutput } from './types';

type Options = UseMutationOptions<MoveVRItemOutput, Error, MoveVRItemInput>;

export const useMoveVRItem = (options?: Options) => {
  return useMutation({
    mutationFn: moveVRItem,
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
