import {
  InfiniteData,
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { produce } from 'immer';

import { FunctionKeyV2 } from '../../constants';
import { GetChatConversationOutput } from '../../queries/getChatConversation/types';
import { APIError } from '../../types';
import { sendMessageToJob } from '.';
import { SendMessageToJobInput, SendMessageToJobOutput } from './types';

type Options = UseMutationOptions<
  SendMessageToJobOutput,
  APIError,
  SendMessageToJobInput
>;

export const useSendMessageToJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageToJob,
    ...options,
    onSuccess: (response, variables, context) => {
      const queryKey = [
        FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
        { inboxId: response.inbox },
      ];
      // queryClient.invalidateQueries({
      //   queryKey: queryKey
      // });
      //

      queryClient.setQueryData(
        queryKey,
        (
          oldData:
            | InfiniteData<
                GetChatConversationOutput,
                { lastKey: string | null }
              >
            | undefined,
        ) => {
          if (oldData) {
            return produce(oldData, (draft) => {
              const newMessage = {
                hash: 'pre-message',
                content: 'loading',
                scheduledTime: new Date().toISOString(),
                isLocal: false,
                inboxId: response.inbox,
                parentHash: '',
                sender: {
                  avatar:
                    'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
                },
                workflowName: undefined,
              };

              if (draft.pages.length > 0) {
                draft.pages[draft.pages.length - 1].push(newMessage);
              } else {
                draft.pages.push([newMessage]);
              }
            });
          }
          return oldData;
        },
      );

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
