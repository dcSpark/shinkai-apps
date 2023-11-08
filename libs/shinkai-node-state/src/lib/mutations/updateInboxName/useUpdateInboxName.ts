import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { updateInboxName } from '.';
import type { UpdateInboxNamebInput, UpdateInboxNameOutput } from './types';

type Options = UseMutationOptions<
  UpdateInboxNameOutput,
  Error,
  UpdateInboxNamebInput
>;

export const useUpdateInboxName = (options?: Options) => {
  return useMutation({
    mutationFn: updateInboxName,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries([FunctionKey.GET_INBOXES]);
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
