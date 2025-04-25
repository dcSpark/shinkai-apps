import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2, generateOptimisticUserMessage } from '../../constants';
import {
  ChatConversationInfiniteData,
  FileTypeSupported,
} from '../../queries/getChatConversation/types';
import { useGetChatConversationWithPagination } from '../../queries/getChatConversation/useGetChatConversationWithPagination';
import { APIError } from '../../types';
import { sendMessageToJob } from '.';
import { SendMessageToJobInput, SendMessageToJobOutput } from './types';

type Options = UseMutationOptions<
  SendMessageToJobOutput,
  APIError,
  SendMessageToJobInput
>;

// only use this for sending message to existing job. For creating a new job, use useCreateJob
export const useSendMessageToJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageToJob,
    ...options,
    onMutate: async (variables) => {
      const queryKey = [
        FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
        {
          inboxId: buildInboxIdFromJobId(variables.jobId),
        },
      ];
      await queryClient.cancelQueries({
        queryKey: queryKey,
      });

      const snapshot = queryClient.getQueryData(queryKey) as ReturnType<
        typeof useGetChatConversationWithPagination
      >;

      queryClient.setQueryData(
        queryKey,
        (old: ChatConversationInfiniteData) => {
          const newMessages = [
            generateOptimisticUserMessage(
              variables.message,
              (variables.files ?? []).map((file) => ({
                name: file.name,
                id: file.name,
                size: file.size,
                type: FileTypeSupported.Unknown,
                preview: URL.createObjectURL(file),
                file,
                path: file.name,
                extension: file.name.split('.').pop() ?? '',
                mimeType: file.type,
              })),
            ),
          ];

          return {
            ...old,
            pages: [
              ...old.pages.slice(0, -1),
              [...(old.pages.at(-1) || []), ...newMessages],
            ],
          };
        },
      );

      return () => {
        queryClient.setQueryData(queryKey, snapshot);
      };
    },
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_JOB_SCOPE],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_VR_FILES],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
    onError: (error, variables, rollback) => {
      rollback?.();
      const queryKey = [
        FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
        {
          inboxId: buildInboxIdFromJobId(variables.jobId),
        },
      ];
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
      if (options?.onError) {
        options.onError(error, variables, rollback);
      }
    },
  });
};
