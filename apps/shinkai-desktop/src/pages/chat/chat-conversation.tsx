import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  buildInboxIdFromJobId,
  extractJobIdFromInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useRetryMessage } from '@shinkai_network/shinkai-node-state/v2/mutations/retryMessage/useRetryMessage';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { MessageList } from '@shinkai_network/shinkai-ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  generateOptimisticAssistantMessage,
  streamingSupportedModels,
} from '../../components/chat/constants';
import { ToolsProvider } from '../../components/chat/context/tools-context';
import ConversationFooter from '../../components/chat/conversation-footer';
import ConversationHeader from '../../components/chat/conversation-header';
import MessageExtra from '../../components/chat/message-extra';
import {
  useWebSocketMessage,
  useWebSocketTools,
} from '../../components/chat/websocket-message';
import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';

const useOptimisticAssistantMessageHandler = () => {
  const queryClient = useQueryClient();

  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const { data, isSuccess: isChatConversationSuccess } =
    useGetChatConversationWithPagination({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      inboxId: inboxId as string,
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
    });

  useEffect(() => {
    if (isChatConversationSuccess && data.content.length === 1) {
      const queryKey = [
        FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
        { inboxId },
      ];
      queryClient.cancelQueries({
        queryKey: queryKey,
      });

      queryClient.setQueryData(
        queryKey,
        (old: ChatConversationInfiniteData) => {
          return {
            ...old,
            pages: [
              ...old.pages.slice(0, -1),
              [
                ...(old.pages.at(-1) || []),
                generateOptimisticAssistantMessage(),
              ],
            ],
          };
        },
      );
    }
  }, [data?.content?.length, inboxId, isChatConversationSuccess, queryClient]);
};

const ChatConversation = () => {
  const { captureAnalyticEvent } = useAnalytics();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const currentInbox = useGetCurrentInbox();
  useOptimisticAssistantMessageHandler();

  useWebSocketMessage({ enabled: true });
  useWebSocketTools({ enabled: true });

  const { data: chatConfig } = useGetChatConfig({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: extractJobIdFromInbox(inboxId),
  });

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentInbox?.agent?.model.split(':')?.[0] as Models,
  );

  // const hasProviderEnableTools =
  //   currentInbox?.agent?.model.split(':')?.[0] === Models.OpenAI ||
  //   currentInbox?.agent?.model.split(':')?.[0] === Models.Ollama;

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isPending: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
    isError,
    error: chatConversationError,
  } = useGetChatConversationWithPagination({
    token: auth?.api_v2_key ?? '',
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    refetchIntervalEnabled:
      !hasProviderEnableStreaming || chatConfig?.stream === false,
  });

  useEffect(() => {
    if (isError) {
      console.error('Failed loading chat conversation', chatConversationError);
      toast.error('Failed loading chat conversation', {
        description:
          chatConversationError?.response?.data?.message ??
          chatConversationError.message,
      });
    }
  }, [chatConversationError, isError]);

  const { mutateAsync: retryMessage } = useRetryMessage();

  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({
    onSuccess: () => {
      captureAnalyticEvent('AI Chat', undefined);
    },
  });

  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      const jobId = encodeURIComponent(buildInboxIdFromJobId(data.jobId));
      navigate(`/inboxes/${jobId}`);
    },
  });

  const regenerateFirstMessage = async (message: string) => {
    if (!auth) return;

    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      content: message,
      llmProvider: currentInbox?.agent?.id ?? '',
      isHidden: false,
    });
  };

  const regenerateMessage = async (messageId: string) => {
    if (!auth) return;
    const decodedInboxId = decodeURIComponent(inboxId);

    await retryMessage({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      inboxId: decodedInboxId,
      messageId: messageId,
    });
  };

  const editAndRegenerateMessage = async (
    content: string,
    parentHash: string,
    workflowName?: string,
  ) => {
    if (!auth) return;
    const decodedInboxId = decodeURIComponent(inboxId);
    const jobId = extractJobIdFromInbox(decodedInboxId);

    await sendMessageToJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      jobId,
      message: content,
      parent: parentHash,
      workflowName,
    });
  };

  return (
    <div className="flex max-h-screen flex-1 flex-col overflow-hidden pt-2">
      <ConversationHeader />
      <ToolsProvider>
        <MessageList
          containerClassName="px-5"
          editAndRegenerateMessage={editAndRegenerateMessage}
          fetchPreviousPage={fetchPreviousPage}
          hasPreviousPage={hasPreviousPage}
          isFetchingPreviousPage={isFetchingPreviousPage}
          isLoading={isChatConversationLoading}
          isSuccess={isChatConversationSuccess}
          messageExtra={<MessageExtra />}
          noMoreMessageLabel={t('chat.allMessagesLoaded')}
          paginatedMessages={data}
          regenerateFirstMessage={regenerateFirstMessage}
          regenerateMessage={regenerateMessage}
        />
      </ToolsProvider>

      <ConversationFooter />
    </div>
  );
};

export default ChatConversation;
