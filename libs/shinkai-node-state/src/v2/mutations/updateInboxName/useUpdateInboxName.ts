import {
  type UseMutationOptions,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type UpdateInboxNameInput, type UpdateInboxNameOutput } from './types';
import { updateInboxName } from '.';

type Options = UseMutationOptions<
  UpdateInboxNameOutput,
  Error,
  UpdateInboxNameInput
>;

export const useUpdateInboxName = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInboxName,
    onSuccess: async (...onSuccessParameters) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_INBOXES_WITH_PAGINATION],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
