import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import {
  FetchPreviousPageOptions,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useInView } from 'react-intersection-observer';

import { getRelativeDateLabel, groupMessagesByDate } from '../../helpers';
import { cn } from '../../utils';
import { Skeleton } from '../skeleton';
import { Message } from './message';

export const MessageList = ({
  noMoreMessageLabel,
  paginatedMessages,
  isSuccess,
  isLoading,
  isFetchingPreviousPage,
  hasPreviousPage,
  fetchPreviousPage,
  fromPreviousMessagesRef,
  containerClassName,
  lastMessageContent,
  isLoadingMessage,
  regenerateMessage,
}: {
  noMoreMessageLabel: string;
  isSuccess: boolean;
  isLoading: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage: boolean;
  fromPreviousMessagesRef: React.MutableRefObject<boolean>;
  paginatedMessages: ChatConversationInfiniteData | undefined;
  fetchPreviousPage: (
    options?: FetchPreviousPageOptions | undefined,
  ) => Promise<
    InfiniteQueryObserverResult<ChatConversationInfiniteData, Error>
  >;
  regenerateMessage: (
    content: string,
    messageHash: string,
    workflowName?: string,
  ) => void;
  containerClassName?: string;
  lastMessageContent: string;
  isLoadingMessage: boolean | undefined;
}) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const previousChatHeightRef = useRef<number>(0);
  const { ref, inView } = useInView();

  const fetchPreviousMessages = useCallback(async () => {
    fromPreviousMessagesRef.current = true;
    await fetchPreviousPage();
  }, [fetchPreviousPage]);

  useEffect(() => {
    if (hasPreviousPage && inView) {
      fetchPreviousMessages();
    }
  }, [hasPreviousPage, inView]);

  // adjust the scroll position of a chat container after new messages are fetched
  useLayoutEffect(() => {
    if (!isFetchingPreviousPage) {
      const chatContainerElement = chatContainerRef.current;
      if (!chatContainerElement) return;
      const currentHeight = chatContainerElement.scrollHeight;
      const previousHeight = previousChatHeightRef.current;
      chatContainerElement.scrollTop = currentHeight - previousHeight;
    }
  }, [paginatedMessages, isFetchingPreviousPage]);

  useEffect(() => {
    const chatContainerElement = chatContainerRef.current;
    if (!chatContainerElement) return;
    const handleScroll = async () => {
      const currentHeight = chatContainerElement.scrollHeight;
      const currentScrollTop = chatContainerElement.scrollTop;
      previousChatHeightRef.current = currentHeight;

      if (inView && hasPreviousPage && !isFetchingPreviousPage) {
        previousChatHeightRef.current = currentHeight - currentScrollTop;
      }
    };

    chatContainerElement.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    return () => {
      chatContainerElement.removeEventListener('scroll', handleScroll);
    };
  }, [
    fetchPreviousMessages,
    hasPreviousPage,
    inView,
    isFetchingPreviousPage,
    paginatedMessages?.pages?.length,
  ]);

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  useEffect(() => {
    if (!fromPreviousMessagesRef.current) {
      scrollToBottom();
    }
  }, [paginatedMessages?.pages]);

  useEffect(() => {
    scrollToBottom();
  }, [isSuccess]);

  useEffect(() => {
    scrollToBottom();
  }, [lastMessageContent]);

  const messageList = paginatedMessages?.content ?? [];

  return (
    <div
      className={cn(
        'scroll flex-1 overflow-y-auto overscroll-none will-change-scroll',
        containerClassName,
      )}
      ref={chatContainerRef}
    >
      {isSuccess &&
        !isFetchingPreviousPage &&
        !hasPreviousPage &&
        (paginatedMessages?.pages ?? [])?.length > 1 && (
          <div className="py-2 text-center text-xs text-gray-100">
            {noMoreMessageLabel}
          </div>
        )}
      <div className="">
        {isLoading && (
          <div className="flex flex-col space-y-3">
            {[...Array(10).keys()].map((index) => (
              <div
                className={cn(
                  'flex w-[95%] items-start gap-2',
                  index % 2 === 0
                    ? 'ml-0 mr-auto flex-row'
                    : 'ml-auto mr-0 flex-row-reverse',
                )}
                key={`${index}`}
              >
                <Skeleton
                  className="h-10 w-10 shrink-0 rounded-full bg-gray-300"
                  key={index}
                />
                <Skeleton
                  className={cn(
                    'h-16 w-full rounded-lg px-2.5 py-3',
                    index % 2 === 0
                      ? 'rounded-tl-none bg-gray-300'
                      : 'rounded-tr-none bg-gray-200',
                  )}
                />
              </div>
            ))}
          </div>
        )}
        {(hasPreviousPage || isFetchingPreviousPage) && (
          <div className="flex flex-col space-y-3" ref={ref}>
            {[...Array(3).keys()].map((index) => (
              <div
                className={cn(
                  'flex w-[95%] items-start gap-2',
                  index % 2 === 0
                    ? 'ml-0 mr-auto flex-row'
                    : 'ml-auto mr-0 flex-row-reverse',
                )}
                key={`${index}`}
              >
                <Skeleton
                  className="h-10 w-10 shrink-0 rounded-full bg-gray-300"
                  key={index}
                />
                <Skeleton
                  className={cn(
                    'h-16 w-full rounded-lg px-2.5 py-3',
                    index % 2 === 0
                      ? 'rounded-tl-none bg-gray-300'
                      : 'rounded-tr-none bg-gray-200',
                  )}
                />
              </div>
            ))}
          </div>
        )}
        {isSuccess && messageList?.length > 0 && (
          <Fragment>
            {Object.entries(groupMessagesByDate(messageList)).map(
              ([date, messages]) => {
                return (
                  <div key={date}>
                    <div
                      className={cn(
                        'relative z-10 m-auto my-2 flex h-[26px] w-fit min-w-[100px] items-center justify-center rounded-xl bg-gray-400 px-2.5 capitalize',
                        'sticky top-5',
                      )}
                    >
                      <span className="text-gray-80 text-xs font-medium">
                        {getRelativeDateLabel(
                          new Date(messages[0].scheduledTime || ''),
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {messages.map((message, messageIndex) => {
                        const previousMessage = messages[messageIndex - 1];

                        const grandparentHash = previousMessage
                          ? previousMessage.parentHash
                          : null;

                        const disabledRetryAndEdit =
                          grandparentHash === null || grandparentHash === '';

                        const handleRetryMessage = () => {
                          regenerateMessage(
                            previousMessage.content,
                            grandparentHash ?? '',
                            previousMessage.workflowName,
                          );
                        };
                        const handleEditMessage = (
                          message: string,
                          workflowName?: string,
                        ) => {
                          regenerateMessage(
                            message,
                            previousMessage?.hash ?? '',
                            workflowName,
                          );
                        };
                        return (
                          <div
                            data-testid={`message-${
                              message.isLocal ? 'local' : 'remote'
                            }-${message.hash}`}
                            key={`${message.hash}`}
                          >
                            <Message
                              disabledEdit={disabledRetryAndEdit}
                              disabledRetry={disabledRetryAndEdit}
                              handleEditMessage={handleEditMessage}
                              handleRetryMessage={handleRetryMessage}
                              message={message}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
            {isLoadingMessage && (
              <Message
                isPending={isLoadingMessage}
                message={{
                  parentHash: '',
                  inboxId: '',
                  hash: '',
                  content: lastMessageContent,
                  scheduledTime: new Date().toISOString(),
                  isLocal: false,
                  workflowName: undefined,
                  sender: {
                    avatar:
                      'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
                  },
                }}
              />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};
