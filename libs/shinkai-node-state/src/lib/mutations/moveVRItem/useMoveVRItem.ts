import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { moveVRItem } from './index';
import { MoveVRItemInput, MoveVRItemOutput } from './types';

type Options = UseMutationOptions<MoveVRItemOutput, Error, MoveVRItemInput>;

export const useMoveVRItem = (options?: Options) => {
  const queryClient = useQueryClient();
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
