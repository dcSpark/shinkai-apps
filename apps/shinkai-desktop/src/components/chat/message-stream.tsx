import {
  WidgetToolType,
  WsMessage,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { createContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { create } from 'zustand';

import { useAuth } from '../../store/auth';
import { useToolsStore } from './context/tools-context';

type UseWebSocketMessage = {
  enabled?: boolean;
  inboxId?: string;
};

const START_ANIMATION_SPEED = 4;
const END_ANIMATION_SPEED = 15;

const createSmoothMessage = (params: {
  onTextUpdate: (delta: string, text: string) => void;
  onFinished?: () => void;
  startSpeed?: number;
}) => {
  const { startSpeed = START_ANIMATION_SPEED } = params;

  let buffer = '';
  const outputQueue: string[] = [];
  let isAnimationActive = false;
  let animationFrameId: number | null = null;

  const stopAnimation = () => {
    isAnimationActive = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const startAnimation = (speed = startSpeed) =>
    new Promise<void>((resolve) => {
      if (isAnimationActive) {
        resolve();
        return;
      }

      isAnimationActive = true;

      const updateText = () => {
        if (!isAnimationActive) {
          cancelAnimationFrame(animationFrameId as number);
          animationFrameId = null;
          resolve();
          return;
        }

        if (outputQueue.length > 0) {
          const charsToAdd = outputQueue.splice(0, speed).join('');
          buffer += charsToAdd;
          params.onTextUpdate(charsToAdd, buffer);
        } else {
          isAnimationActive = false;
          animationFrameId = null;
          params.onFinished?.();
          resolve();
          return;
        }
        animationFrameId = requestAnimationFrame(updateText);
      };

      animationFrameId = requestAnimationFrame(updateText);
    });

  const pushToQueue = (text: string) => {
    outputQueue.push(...text.split(''));
  };

  const reset = () => {
    buffer = '';
    outputQueue.length = 0;
    stopAnimation();
  };

  return {
    isAnimationActive,
    isTokenRemain: () => outputQueue.length > 0,
    pushToQueue,
    startAnimation,
    stopAnimation,
    reset,
  };
};

export const useWebSocketMessage = ({
  enabled,
  inboxId: defaultInboxId,
}: UseWebSocketMessage) => {
  const auth = useAuth((state) => state.auth);
  const nodeAddressUrl = new URL(auth?.node_address ?? 'http://localhost:9850');
  const socketUrl = `ws://${nodeAddressUrl.hostname}:${Number(nodeAddressUrl.port) + 1}/ws`;
  const queryClient = useQueryClient();

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    { share: true },
    enabled,
  );
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = defaultInboxId || decodeURIComponent(encodedInboxId);

  const queryKey = [
    FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
    {
      inboxId,
    },
  ];

  useEffect(() => {
    if (!enabled) return;
    if (lastMessage?.data) {
      try {
        const parseData: WsMessage = JSON.parse(lastMessage.data);
        if (parseData.message_type !== 'Stream' || parseData.inbox !== inboxId)
          return;
        queryClient.setQueryData(
          queryKey,
          produce((draft: ChatConversationInfiniteData | undefined) => {
            if (!draft?.pages?.[0]) return;
            const lastMessage = draft.pages.at(-1)?.at(-1);
            console.log(lastMessage, 'lastMessage');
            if (
              lastMessage &&
              lastMessage.role === 'assistant' &&
              lastMessage.status?.type === 'running'
            ) {
              lastMessage.content = lastMessage.content + parseData.message;
            }
          }),
        );
        if (parseData.metadata?.is_done === true) {
          queryClient.invalidateQueries({ queryKey });
        }
      } catch (error) {
        console.error('Failed to parse ws message', error);
      }
    }
  }, [
    auth?.node_address,
    auth?.shinkai_identity,
    auth?.profile,
    enabled,
    inboxId,
    lastMessage?.data,
    queryClient,
  ]);

  useEffect(() => {
    if (!enabled) return;
    const wsMessage = {
      subscriptions: [{ topic: 'inbox', subtopic: inboxId }],
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

  return {
    readyState,
  };
};

export const useWebSocketTools = ({ enabled }: UseWebSocketMessage) => {
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
  const queryClient = useQueryClient();
  const isToolReceived = useRef(false);

  const setWidget = useToolsStore((state) => state.setWidget);
  const setTool = useToolsStore((state) => state.setTool);

  useEffect(() => {
    if (!enabled) return;
    if (lastMessage?.data) {
      console.log(JSON.parse(lastMessage.data), 'lastMessage?.data');
      try {
        const parseData: WsMessage = JSON.parse(lastMessage.data);
        // TODO: fix current tools
        if (
          parseData.message_type === 'ShinkaiMessage' &&
          isToolReceived.current
        ) {
          isToolReceived.current = false;
          const paginationKey = [
            FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
            { inboxId: inboxId as string },
          ];
          queryClient.invalidateQueries({ queryKey: paginationKey });
          setTimeout(() => {
            setTool(null);
          }, 1000);
          return;
        }
        if (
          parseData.message_type === 'Widget' &&
          parseData?.widget?.ToolRequest
        ) {
          isToolReceived.current = true;
          const tool = parseData.widget.ToolRequest;

          setTool({
            name: tool.tool_name,
            args: tool.args.arguments,
            status: tool.status.type_,
            toolRouterKey: '',
            result: tool.result?.data.message,
          });
        }
        if (
          parseData.message_type === 'Widget' &&
          parseData?.widget?.PaymentRequest
        ) {
          const widgetName = Object.keys(parseData.widget)[0];
          setWidget({
            name: widgetName as WidgetToolType,
            data: parseData.widget[widgetName as WidgetToolType],
          });
        }
      } catch (error) {
        console.error('Failed to parse ws message', error);
      }
    }
  }, [enabled, inboxId, lastMessage?.data, queryClient]);

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

  return { readyState };
};

export function WebsocketMessage({
  isLoadingMessage,
  isWsEnabled,
}: {
  isLoadingMessage: boolean;
  isWsEnabled: boolean;
}) {
   useWebSocketMessage({
    enabled: isWsEnabled,
  });
  useWebSocketTools({ enabled: true });
  return null;
  // return isLoadingMessage ? (
  //   <Message
  //     isPending={isLoadingMessage}
  //     message={{
  //       status: {
  //         type: 'running',
  //       },
  //       toolCalls: tool ? [tool] : [],
  //       role: 'assistant',
  //       messageId: '',
  //       createdAt: new Date().toISOString(),
  //       metadata: {
  //         parentMessageId: '',
  //         inboxId: '',
  //       },
  //       content:
  //         tool?.status === 'Running'
  //           ? '...'
  //           : tool?.status === 'Complete'
  //             ? 'Getting AI response ...' // trick for now, ollama tool calls only works with stream off
  //             : messageContent,
  //     }}
  //   />
  // ) : null;
}

type ContentPartState = {
  type: 'text';
  text: string;
  part: {
    type: 'text';
    text: string;
  };
  status: {
    type: 'complete' | 'running';
  };
};

export const ContentPartContext = createContext({});
const COMPLETE_STATUS = {
  type: 'complete' as const,
};

const RUNNING_STATUS = {
  type: 'running' as const,
};

export const TextContentPartProvider = ({
  isRunning,
  text,
  children,
}: {
  text: string;
  isRunning?: boolean | undefined;
  children: React.ReactNode;
}) => {
  const [store] = useState(() => {
    return create<ContentPartState>(() => ({
      status: isRunning ? RUNNING_STATUS : COMPLETE_STATUS,
      part: { type: 'text', text },
      type: 'text',
      text: '',
    }));
  });

  useEffect(() => {
    const state = store.getState() as ContentPartState & {
      type: 'text';
    };

    const textUpdated = state.text !== text;
    const targetStatus = isRunning ? RUNNING_STATUS : COMPLETE_STATUS;
    const statusUpdated = state.status !== targetStatus;

    if (!textUpdated && !statusUpdated) return;

    store.setState(
      {
        type: 'text',
        text,
        part: { type: 'text', text },
        status: targetStatus,
      } satisfies ContentPartState,
      true,
    );
  }, [store, isRunning, text]);

  return (
    <ContentPartContext.Provider value={store}>
      {children}
    </ContentPartContext.Provider>
  );
};
