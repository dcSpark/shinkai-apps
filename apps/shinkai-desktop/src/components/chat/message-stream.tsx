import {
  WidgetToolType,
  WsMessage,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import { Message } from '@shinkai_network/shinkai-ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import { useAuth } from '../../store/auth';
import { useToolsStore } from './context/tools-context';

type AnimationState = {
  displayedContent: string;
};

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
    {
      share: true,
      filter: (message) => {
        try {
          const data = JSON.parse(message.data);
          return data.message_type === 'Stream' || data.inbox === inboxId;
        } catch (e) {
          return false;
        }
      },
    },
    enabled,
  );
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = defaultInboxId || decodeURIComponent(encodedInboxId);

  const [animationState, setAnimationState] = useState<AnimationState>({
    displayedContent: '',
  });
  const isStreamingFinished = useRef(false);

  const textControllerRef = useRef<ReturnType<
    typeof createSmoothMessage
  > | null>(null);

  useEffect(() => {
    textControllerRef.current = createSmoothMessage({
      onTextUpdate: (_, text) => {
        if (isStreamingFinished.current) return;
        setAnimationState({
          displayedContent: text,
        });
      },
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!textControllerRef.current) return;
    if (lastMessage?.data) {
      try {
        const parseData: WsMessage = JSON.parse(lastMessage.data);
        if (parseData.message_type !== 'Stream' || parseData.inbox !== inboxId)
          return;
        isStreamingFinished.current = false;
        if (parseData.metadata?.is_done === true) {
          textControllerRef.current.stopAnimation();
          if (textControllerRef.current.isTokenRemain()) {
            textControllerRef.current.startAnimation(END_ANIMATION_SPEED);
          }

          const paginationKey = [
            FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
            { inboxId: inboxId as string },
          ];
          queryClient.invalidateQueries({ queryKey: paginationKey });
          isStreamingFinished.current = true;
          // TODO: unify streaming message as part of messages cache to avoid layout shift
          setTimeout(() => {
            setAnimationState({ displayedContent: '' });
            textControllerRef.current?.reset();
          }, 600);
        }

        textControllerRef.current?.pushToQueue(parseData.message);

        if (!textControllerRef.current.isAnimationActive)
          textControllerRef.current.startAnimation();
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
    messageContent: animationState.displayedContent,
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
        // if (
        //   parseData.message_type === 'ShinkaiMessage' &&
        //   isToolReceived.current
        // ) {
        //   isToolReceived.current = false;
        //   const paginationKey = [
        //     FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
        //     { inboxId: inboxId as string },
        //   ];
        //   queryClient.invalidateQueries({ queryKey: paginationKey });
        //   setTimeout(() => {
        //     setTool(null);
        //   }, 1000);
        //   return;
        // }
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
          return;
        }
        if (
          parseData.message_type === 'Widget' &&
          parseData?.widget?.PaymentRequest
        ) {
          isToolReceived.current = true;
          console.log('render payment', parseData);
          const widgetName = Object.keys(parseData.widget)[0];
          setWidget({
            name: widgetName as WidgetToolType,
            data: parseData.widget[widgetName as WidgetToolType],
          });
          return;
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
  const { messageContent } = useWebSocketMessage({
    enabled: isWsEnabled,
  });
  useWebSocketTools({ enabled: true });

  const tool = useToolsStore((state) => state.tool);

  return isLoadingMessage ? (
    <Message
      isPending={isLoadingMessage}
      message={{
        toolCalls: tool ? [tool] : [],
        parentHash: '',
        inboxId: '',
        hash: '',
        content:
          tool?.status === 'Running'
            ? '...'
            : tool?.status === 'Complete'
              ? 'Getting AI response ...' // trick for now, ollama tool calls only works with stream off
              : messageContent,
        scheduledTime: new Date().toISOString(),
        isLocal: false,
        workflowName: undefined,
        sender: {
          avatar:
            'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
        },
      }}
    />
  ) : null;
}
