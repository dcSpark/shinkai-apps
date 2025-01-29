import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { updateInboxName } from '.';
import type { UpdateInboxNameInput, UpdateInboxNameOutput } from './types';

type Options = UseMutationOptions<
  UpdateInboxNameOutput,
  Error,
  UpdateInboxNameInput
>;

export const useUpdateInboxName = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInboxName,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_INBOXES_WITH_PAGINATION],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
