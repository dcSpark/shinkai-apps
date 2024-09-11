import { WsMessage } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import { Message } from '@shinkai_network/shinkai-ui';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import { useAuth } from '../../store/auth';

type AnimationState = {
  displayedContent: string;
  pendingContent: string;
};

type UseWebSocketMessage = {
  enabled?: boolean;
};

export const useWebSocketMessage = ({ enabled }: UseWebSocketMessage) => {
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
  const inboxId = decodeURIComponent(encodedInboxId);

  const isStreamFinishedRef = useRef(false);
  const [animationState, setAnimationState] = useState<AnimationState>({
    displayedContent: '',
    pendingContent: '',
  });

  const animationFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const animateText = useCallback(() => {
    setAnimationState((prevState) => {
      if (
        prevState.pendingContent.length === 0 &&
        isStreamFinishedRef.current
      ) {
        isAnimatingRef.current = false;
        return prevState;
      }

      const chunkSize = Math.max(
        1,
        Math.round(prevState.pendingContent.length / 90),
      );

      const nextChunk = prevState.pendingContent.slice(0, chunkSize);
      const remainingPending = prevState.pendingContent.slice(chunkSize);

      return {
        displayedContent: prevState.displayedContent + nextChunk,
        pendingContent: remainingPending,
      };
    });

    if (isAnimatingRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateText);
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(animateText);
    }
  }, [animateText]);

  useEffect(() => {
    if (!enabled) return;
    if (lastMessage?.data) {
      try {
        const parseData: WsMessage = JSON.parse(lastMessage.data);
        if (parseData.message_type !== 'Stream') return;
        isStreamFinishedRef.current = false;
        if (parseData.metadata?.is_done === true) {
          isStreamFinishedRef.current = true;
        }

        setAnimationState((prevState) => ({
          ...prevState,
          pendingContent: prevState.pendingContent + parseData.message,
        }));

        startAnimation();
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
    startAnimation,
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

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isStreamFinishedRef.current) {
      const paginationKey = [
        FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
        {
          nodeAddress: auth?.node_address ?? '',
          inboxId: inboxId as string,
          shinkaiIdentity: auth?.shinkai_identity ?? '',
          profile: auth?.profile ?? '',
        },
      ];
      queryClient.invalidateQueries({ queryKey: paginationKey });
      setTimeout(() => {
        setAnimationState({
          displayedContent: '',
          pendingContent: '',
        });
      }, 500);
    }
  }, [
    isStreamFinishedRef.current,
    auth?.node_address,
    auth?.profile,
    auth?.shinkai_identity,
    inboxId,
    queryClient,
  ]);

  return {
    messageContent: animationState.displayedContent,
    isStreamFinished: isStreamFinishedRef.current,
    readyState,
  };
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

  return isLoadingMessage ? (
    <Message
      isPending={isLoadingMessage}
      message={{
        parentHash: '',
        inboxId: '',
        hash: '',
        content: messageContent,
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
