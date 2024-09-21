import { WsMessage } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import { GetChatConversationOutput } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { Message } from '@shinkai_network/shinkai-ui';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
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
const START_ANIMATION_SPEED = 4;
const createSmoothMessage = (params: {
  onTextUpdate: (delta: string, text: string) => void;
  startSpeed?: number;
}) => {
  const { startSpeed = START_ANIMATION_SPEED } = params;

  let buffer = '';
  // why use queue: https://shareg.pt/GLBrjpK
  const outputQueue: string[] = [];
  let isAnimationActive = false;
  let animationFrameId: number | null = null;

  // when you need to stop the animation, call this function
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
          cancelAnimationFrame(animationFrameId!);
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

  return {
    isAnimationActive,
    isTokenRemain: () => outputQueue.length > 0,
    pushToQueue,
    startAnimation,
    stopAnimation,
  };
};

export const useWebSocketMessage = ({ enabled }: UseWebSocketMessage) => {
  const auth = useAuth((state) => state.auth);
  const nodeAddressUrl = new URL(auth?.node_address ?? 'http://localhost:9850');
  const socketUrl = `ws://${nodeAddressUrl.hostname}:${Number(nodeAddressUrl.port) + 1}/ws`;
  const queryClient = useQueryClient();
  const [output, setOutput] = useState('');

  const textControllerRef = useRef<ReturnType<
    typeof createSmoothMessage
  > | null>(null);

  useEffect(() => {
    textControllerRef.current = createSmoothMessage({
      onTextUpdate: (_, text) => {
        setOutput(text);
      },
    });
  }, []);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    { share: true },
    enabled,
  );
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  useEffect(() => {
    if (!enabled) return;
    if (!textControllerRef.current) return;
    if (lastMessage?.data) {
      try {
        const parseData: WsMessage = JSON.parse(lastMessage.data);
        if (parseData.message_type !== 'Stream') return;
        // isStreamFinishedRef.current = false;
        if (parseData.metadata?.is_done === true) {
          textControllerRef.current?.stopAnimation();

          // if (textControllerRef.current.isTokenRemain()) {
          //   textControllerRef.current.startAnimation(15);
          // }
          //
          // return;
        }

        textControllerRef.current?.pushToQueue(parseData.message);

        if (!textControllerRef.current?.isAnimationActive)
          textControllerRef.current?.startAnimation();

        //   InfiniteData<
        //     GetChatConversationOutput,
        //     { lastKey: string | null }
        //   >
        // >([FunctionKey.GET_CHAT_CONVERSATION_PAGINATION, { inboxId }]);
        // const hasExist = prevData.pages
        //   .flat()
        //   .find((item) => item.hash === 'pre-message');
        //
        // hasExist
        // setAnimationState((prevState) => ({
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

  useEffect(() => {
    if (output) {
      queryClient.setQueryData<
        InfiniteData<GetChatConversationOutput, { lastKey: string | null }>
      >(
        [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION, { inboxId }],
        (prevData) => {
          if (!prevData) return prevData;

          return produce(prevData, (draft) => {
            draft.pages = draft.pages.map((page) => {
              const preMessageIndex = page.findIndex(
                (item) => item.hash === 'pre-message',
              );
              if (preMessageIndex !== -1) {
                page[preMessageIndex] = {
                  ...page[preMessageIndex],
                  content: output,
                };
              }
              return page;
            });
          });
        },
      );
    }
  }, [output, queryClient, inboxId]);

  // useEffect(() => {
  //   if (isStreamFinishedRef.current) {
  //     const paginationKey = [
  //       FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
  //       { inboxId: inboxId as string },
  //     ];
  //     queryClient.invalidateQueries({ queryKey: paginationKey });
  //     setTimeout(() => {
  //       setAnimationState({
  //         displayedContent: '',
  //         pendingContent: '',
  //       });
  //     }, 500);
  //   }
  // }, [
  //   isStreamFinishedRef.current,
  //   auth?.node_address,
  //   auth?.profile,
  //   auth?.shinkai_identity,
  //   inboxId,
  //   queryClient,
  // ]);

  return {
    messageContent: output,
    isStreamFinished: false, // todo
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
  useWebSocketMessage({
    enabled: isWsEnabled,
  });
  //  need to avoid rendering to prevent flickering and causing scroll to jump
  return null;
  // return isLoadingMessage ? (
  //   <Message
  //     isPending={isLoadingMessage}
  //     message={{
  //       parentHash: '',
  //       inboxId: '',
  //       hash: '',
  //       content: messageContent,
  //       scheduledTime: new Date().toISOString(),
  //       isLocal: false,
  //       workflowName: undefined,
  //       sender: {
  //         avatar:
  //           'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
  //       },
  //     }}
  //   />
  // ) : null;
}
