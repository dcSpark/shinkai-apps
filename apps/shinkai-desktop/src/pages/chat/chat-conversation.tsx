import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  WidgetToolState,
  WidgetToolType,
  WsMessage,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  buildInboxIdFromJobId,
  extractErrorPropertyOrContent,
  extractJobIdFromInbox,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useRetryMessage } from '@shinkai_network/shinkai-node-state/v2/mutations/retryMessage/useRetryMessage';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/v2/mutations/sendMessageToJob/useSendMessageToJob';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  MessageList,
} from '@shinkai_network/shinkai-ui';
import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { toast } from 'sonner';

import { streamingSupportedModels } from '../../components/chat/constants';
import ConversationFooter from '../../components/chat/conversation-footer';
import ConversationHeader from '../../components/chat/conversation-header';
import MessageExtra from '../../components/chat/message-extra';
import { WebsocketMessage } from '../../components/chat/message-stream';
import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';

enum ErrorCodes {
  VectorResource = 'VectorResource',
  ShinkaiBackendInferenceLimitReached = 'ShinkaiBackendInferenceLimitReached',
}
type UseWebSocketMessage = {
  enabled?: boolean;
};

const useWebSocketToolWidget = ({ enabled }: UseWebSocketMessage) => {
  const auth = useAuth((state) => state.auth);
  const nodeAddressUrl = new URL(auth?.node_address ?? 'http://localhost:9850');
  const socketUrl = `ws://${nodeAddressUrl.hostname}:${Number(nodeAddressUrl.port) + 1}/ws`;
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    { share: true },
    enabled,
  );
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  const [widgetTool, setWidgetTool] = useState<WidgetToolState | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (lastMessage?.data) {
      try {
        const parseData: WsMessage = JSON.parse(lastMessage.data);
        if (parseData.message_type === 'Widget' && parseData?.widget) {
          const widgetName = Object.keys(parseData.widget)[0];
          setWidgetTool({
            name: widgetName as WidgetToolType,
            data: parseData.widget[widgetName as WidgetToolType],
          });
        }
      } catch (error) {
        console.error('Failed to parse ws message', error);
      }
    }
  }, [enabled, lastMessage?.data]);

  useEffect(() => {
    if (!enabled) return;
    const wsMessage = {
      subscriptions: [{ topic: 'widget', subtopic: inboxId }],
      unsubscriptions: [],
    };
    const wsMessageString = JSON.stringify(wsMessage);
    const shinkaiMessage = ShinkaiMessageBuilderWrapper.ws_connection(
      wsMessageString,
      auth?.profile_encryption_sk ?? '',
      auth?.profile_identity_sk ?? '',
      auth?.node_encryption_pk ?? '',
      auth?.shinkai_identity ?? '',
      auth?.profile ?? '',
      auth?.shinkai_identity ?? '',
      '',
    );
    sendMessage(shinkaiMessage);
  }, [
    auth?.node_encryption_pk,
    auth?.profile,
    auth?.profile_encryption_sk,
    auth?.profile_identity_sk,
    auth?.shinkai_identity,
    enabled,
    inboxId,
    sendMessage,
  ]);

  return { readyState, widgetTool, setWidgetTool };
};

const ChatConversation = () => {
  const { captureAnalyticEvent } = useAnalytics();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const currentInbox = useGetCurrentInbox();

  const { data: chatConfig } = useGetChatConfig({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: extractJobIdFromInbox(inboxId),
  });

  const hasProviderEnableStreaming = streamingSupportedModels.includes(
    currentInbox?.agent?.model.split(':')?.[0] as Models,
  );

  const hasProviderEnableTools =
    currentInbox?.agent?.model.split(':')?.[0] === Models.OpenAI;

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

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return isJobInbox(inboxId) && lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  const { widgetTool, setWidgetTool } = useWebSocketToolWidget({
    enabled: hasProviderEnableTools,
  });

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

  // endpoint doesnt support retry in first message yet
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

  const isLimitReachedErrorLastMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (!lastMessage) return;
    const errorCode = extractErrorPropertyOrContent(
      lastMessage.content,
      'error',
    );
    return errorCode === ErrorCodes.ShinkaiBackendInferenceLimitReached;
  }, [data?.pages]);

  return (
    <div className="flex max-h-screen flex-1 flex-col overflow-hidden pt-2">
      <ConversationHeader />
      <MessageList
        containerClassName="px-5"
        editAndRegenerateMessage={editAndRegenerateMessage}
        fetchPreviousPage={fetchPreviousPage}
        hasPreviousPage={hasPreviousPage}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isLoading={isChatConversationLoading}
        isSuccess={isChatConversationSuccess}
        lastMessageContent={
          <WebsocketMessage
            isLoadingMessage={isLoadingMessage ?? false}
            isWsEnabled={
              hasProviderEnableStreaming && chatConfig?.stream === true
            }
          />
        }
        messageExtra={
          <MessageExtra
            metadata={widgetTool?.data}
            name={widgetTool?.name}
            onCancel={() => {
              setWidgetTool(null);
            }}
          />
        }
        noMoreMessageLabel={t('chat.allMessagesLoaded')}
        paginatedMessages={data}
        regenerateFirstMessage={regenerateFirstMessage}
        regenerateMessage={regenerateMessage}
      />
      {isLimitReachedErrorLastMessage && (
        <Alert className="mx-auto w-[98%] shadow-lg" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">
            {t('chat.limitReachedTitle')}
          </AlertTitle>
          <AlertDescription className="text-gray-80 text-xs">
            <div className="flex flex-row items-center space-x-2">
              {t('chat.limitReachedDescription')}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isLimitReachedErrorLastMessage && <ConversationFooter />}
    </div>
  );
};

export default ChatConversation;
