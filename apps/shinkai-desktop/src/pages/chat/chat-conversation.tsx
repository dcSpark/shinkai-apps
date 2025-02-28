import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import {
  FunctionKeyV2,
  generateOptimisticAssistantMessage,
} from '@shinkai_network/shinkai-node-state/v2/constants';
import { useRetryMessage } from '@shinkai_network/shinkai-node-state/v2/mutations/retryMessage/useRetryMessage';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { MessageList } from '../../components/chat/components/message-list';
import { streamingSupportedModels } from '../../components/chat/constants';
import { useChatStore } from '../../components/chat/context/chat-context';
import ConversationChatFooter from '../../components/chat/conversation-footer';
import ConversationHeader from '../../components/chat/conversation-header';
import MessageExtra from '../../components/chat/message-extra';
import {
  useWebSocketMessage,
  useWebSocketTools,
} from '../../components/chat/websocket-message';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import EmptyMessage from './empty-message';

export const useChatConversationWithOptimisticUpdates = ({
  inboxId,
  forceRefetchInterval,
}: {
  inboxId: string;
  forceRefetchInterval?: boolean;
}) => {
  const queryClient = useQueryClient();
  const auth = useAuth((state) => state.auth);

  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
    },
    {
      enabled: !!inboxId,
    },
  );
  const { data: provider } = useGetProviderFromJob({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
  });

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    provider?.agent?.model.split(':')?.[0] as Models,
  );

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
    enabled: !!inboxId,
  });

  useEffect(() => {
    if (
      isChatConversationSuccess &&
      data.content.length % 2 === 1 &&
      data.content.at(-1)?.role === 'user'
    ) {
      const queryKey = [
        FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
        { inboxId },
      ];

      queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(
        queryKey,
        produce((draft: ChatConversationInfiniteData | undefined) => {
          if (!draft?.pages?.[0]) return;
          draft?.pages?.at(-1)?.push(generateOptimisticAssistantMessage());
        }),
      );
    }
  }, [
    data?.content.length,
    inboxId,
    isChatConversationSuccess,
    queryClient,
    data?.content,
  ]);

  useEffect(() => {
    if (forceRefetchInterval) {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [
            FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
            { inboxId },
          ],
        });
      }, 6000);
    }
  }, [forceRefetchInterval, inboxId, queryClient]);

  return {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    isError,
    chatConversationError,
  };
};

const ChatConversation = () => {
  const { captureAnalyticEvent } = useAnalytics();
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  useWebSocketMessage({ inboxId, enabled: !!inboxId });
  useWebSocketTools({ inboxId, enabled: !!inboxId });

  const setSelectedArtifact = useChatStore(
    (state) => state.setSelectedArtifact,
  );

  const auth = useAuth((state) => state.auth);
  const optInExperimental = useSettings((state) => state.optInExperimental);

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isChatConversationLoading,
    isFetchingPreviousPage,
    isChatConversationSuccess,
    isError,
    chatConversationError,
  } = useChatConversationWithOptimisticUpdates({
    inboxId,
  });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!inboxId &&
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.status.type === 'running'
    );
  }, [data?.pages, inboxId]);

  useEffect(() => {
    if (isError) {
      toast.error('Failed loading chat conversation', {
        description:
          chatConversationError?.response?.data?.message ??
          chatConversationError?.message,
      });
    }
  }, [chatConversationError, isError]);

  useEffect(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (
      optInExperimental &&
      lastMessage?.role === 'assistant' &&
      lastMessage.artifacts?.length > 0
    ) {
      setSelectedArtifact(lastMessage.artifacts?.at(-1) ?? null);
    }
  }, [data?.pages, optInExperimental]);

  const { mutateAsync: retryMessage } = useRetryMessage();

  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({
    onSuccess: () => {
      captureAnalyticEvent('AI Chat', undefined);
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION, { inboxId }],
      });
    },
  });

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
    });
  };

  return (
    <div className="flex max-h-screen flex-1 flex-col overflow-hidden pt-2">
      <ConversationHeader />
      {inboxId ? (
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
          regenerateMessage={regenerateMessage}
        />
      ) : (
        <EmptyMessage />
      )}
      <ConversationChatFooter
        inboxId={inboxId}
        isLoadingMessage={!!isLoadingMessage}
      />
    </div>
  );
};

export default ChatConversation;
