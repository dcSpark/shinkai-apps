import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { updateNodeName } from '.';
import { UpdateNodeNameInput, UpdateNodeNameOutput } from './types';

type Options = UseMutationOptions<
  UpdateNodeNameOutput,
  Error,
  UpdateNodeNameInput
>;

export const useUpdateNodeName = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNodeName,
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
