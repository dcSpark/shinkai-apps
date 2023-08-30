import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { createChat } from '.';
import { CreateChatInput, CreateChatOutput } from './types';

type Options = UseMutationOptions<CreateChatOutput, Error, CreateChatInput>;

export const useCreateChat = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChat,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_INBOXES],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
