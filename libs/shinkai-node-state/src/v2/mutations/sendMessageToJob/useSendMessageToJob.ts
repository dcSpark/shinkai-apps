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
        (old: ChatConversationInfiniteData | undefined): ChatConversationInfiniteData => {
          const newOptimisticMessage = generateOptimisticUserMessage(
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
          );

          if (!old || !old.pages || old.pages.length === 0) {
            // If no previous data or pages, start fresh
            return {
              content: [], // Assuming an empty content array is needed
              pages: [[newOptimisticMessage]], // Start with a single page containing the new message
              pageParams: [undefined], // Adjust pageParams structure as needed for your infinite query
            };
          } else {
            // If previous data exists, append to the last page
            const lastPageIndex = old.pages.length - 1;
            const updatedLastPage = [
              ...old.pages[lastPageIndex],
              newOptimisticMessage,
            ];
            const updatedPages = [
              ...old.pages.slice(0, lastPageIndex),
              updatedLastPage,
            ];

            return {
              ...old,
              pages: updatedPages,
            };
          }
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
