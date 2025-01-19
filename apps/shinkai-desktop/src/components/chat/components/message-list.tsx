import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { Skeleton } from '@shinkai_network/shinkai-ui';
import {
  getRelativeDateLabel,
  groupMessagesByDate,
} from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  FetchPreviousPageOptions,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import React, {
  Fragment,
  memo,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useInView } from 'react-intersection-observer';

import { Message } from './message';

function useScrollToBottom(
  scrollRef: RefObject<HTMLDivElement>,
  detach = false,
) {
  const [autoScroll, setAutoScroll] = useState(true);
  function scrollDomToBottom() {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
      });
    }
  }

  useEffect(() => {
    if (autoScroll && !detach) {
      scrollDomToBottom();
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
}

export const MessageList = memo(
  ({
    noMoreMessageLabel,
    paginatedMessages,
    isSuccess,
    isLoading,
    isFetchingPreviousPage,
    hasPreviousPage,
    fetchPreviousPage,
    containerClassName,
    lastMessageContent,
    editAndRegenerateMessage,
    regenerateMessage,
    regenerateFirstMessage,
    disabledRetryAndEdit,
    messageExtra,
    hidePythonExecution,
  }: {
    noMoreMessageLabel: string;
    isSuccess: boolean;
    isLoading: boolean;
    isFetchingPreviousPage: boolean;
    hasPreviousPage: boolean;
    paginatedMessages: ChatConversationInfiniteData | undefined;
    fetchPreviousPage: (
      options?: FetchPreviousPageOptions | undefined,
    ) => Promise<
      InfiniteQueryObserverResult<ChatConversationInfiniteData, Error>
    >;
    regenerateMessage?: (messageId: string) => void;
    regenerateFirstMessage?: (message: string) => void;
    editAndRegenerateMessage?: (content: string, messageHash: string) => void;
    containerClassName?: string;
    lastMessageContent?: React.ReactNode;
    disabledRetryAndEdit?: boolean;
    messageExtra?: React.ReactNode;
    hidePythonExecution?: boolean;
  }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const previousChatHeightRef = useRef<number>(0);
    const { ref, inView } = useInView();
    const messageList = paginatedMessages?.pages.flat() ?? [];

    const { autoScroll, setAutoScroll, scrollDomToBottom } =
      useScrollToBottom(chatContainerRef);

    const fetchPreviousMessages = useCallback(async () => {
      setAutoScroll(false);
      await fetchPreviousPage();
    }, [fetchPreviousPage]);

    useEffect(() => {
      if (hasPreviousPage && inView) {
        fetchPreviousMessages();
      }
    }, [hasPreviousPage, inView]);

    // adjust the scroll position of a chat container after new messages are fetched
    useLayoutEffect(() => {
      if (!isFetchingPreviousPage && inView) {
        const chatContainerElement = chatContainerRef.current;
        if (!chatContainerElement) return;
        const currentHeight = chatContainerElement.scrollHeight;
        const previousHeight = previousChatHeightRef.current;

        if (!autoScroll) {
          chatContainerElement.scrollTop =
            currentHeight - previousHeight + chatContainerElement.scrollTop;
        } else {
          scrollDomToBottom();
        }

        chatContainerElement.scrollTop = currentHeight - previousHeight;
      }
    }, [paginatedMessages, isFetchingPreviousPage, inView]);

    useEffect(() => {
      const chatContainerElement = chatContainerRef.current;
      if (!chatContainerElement) return;
      const handleScroll = async () => {
        const currentHeight = chatContainerElement.scrollHeight;
        const currentScrollTop = chatContainerElement.scrollTop;
        previousChatHeightRef.current = currentHeight;
        const scrollThreshold = 100;
        const isNearBottom =
          currentScrollTop + chatContainerElement.clientHeight >=
          currentHeight - scrollThreshold;

        setAutoScroll(isNearBottom);

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

    useEffect(() => {
      if (messageList?.length % 2 === 1) {
        scrollDomToBottom();
      }
    }, [messageList?.length]);

    useEffect(() => {
      if (isSuccess) {
        scrollDomToBottom();
      }
    }, [isSuccess]);

    return (
      <div
        className={cn(
          'scroll size-full overflow-y-auto overscroll-none will-change-scroll',
          'flex-1 overflow-y-auto',
          containerClassName,
        )}
        ref={chatContainerRef}
        style={{ contain: 'strict' }}
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
            <div className="flex flex-col space-y-8">
              {[...Array(10).keys()].map((index) => (
                <div
                  className={cn(
                    'flex w-[85%] gap-2',
                    index % 2 === 0
                      ? 'ml-0 mr-auto flex-row items-end'
                      : 'ml-auto mr-0 flex-row-reverse items-start',
                  )}
                  key={`${index}`}
                >
                  <Skeleton
                    className="h-8 w-8 shrink-0 rounded-full bg-gray-300"
                    key={index}
                  />
                  <Skeleton
                    className={cn(
                      'w-full rounded-lg px-2.5 py-3',
                      index % 2 === 0
                        ? 'h-24 rounded-bl-none bg-gray-300'
                        : 'h-16 rounded-tr-none bg-gray-200',
                      index % 3 === 0 && 'h-32',
                    )}
                  />
                </div>
              ))}
            </div>
          )}
          {(hasPreviousPage || isFetchingPreviousPage) && (
            <div className="flex flex-col space-y-3" ref={ref}>
              {[...Array(4).keys()].map((index) => (
                <div
                  className={cn(
                    'flex w-[85%] gap-2',
                    index % 2 === 0
                      ? 'ml-0 mr-auto flex-row items-end'
                      : 'ml-auto mr-0 flex-row-reverse items-start',
                  )}
                  key={`${index}`}
                >
                  <Skeleton
                    className="h-8 w-8 shrink-0 rounded-full bg-gray-300"
                    key={index}
                  />
                  <Skeleton
                    className={cn(
                      'w-full rounded-lg px-2.5 py-3',
                      index % 2 === 0
                        ? 'h-24 rounded-bl-none bg-gray-300'
                        : 'h-16 rounded-tr-none bg-gray-200',
                      index % 3 === 0 && 'h-32',
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
                            new Date(messages[0].createdAt || ''),
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        {messages.map((message, messageIndex) => {
                          const previousMessage = messages[messageIndex - 1];

                          const grandparentHash = previousMessage
                            ? previousMessage.metadata.parentMessageId
                            : null;

                          const firstMessageRetry =
                            disabledRetryAndEdit ??
                            (grandparentHash === null ||
                              grandparentHash === '');
                          const disabledRetryAndEditValue =
                            disabledRetryAndEdit ??
                            (grandparentHash === null ||
                              grandparentHash === '');

                          const handleRetryMessage = () => {
                            regenerateMessage?.(message?.messageId ?? '');
                          };

                          const handleEditMessage = (message: string) => {
                            editAndRegenerateMessage?.(
                              message,
                              previousMessage?.messageId ?? '',
                            );
                          };

                          const handleFirstMessageRetry = () => {
                            regenerateFirstMessage?.(previousMessage.content);
                          };

                          return (
                            <Message
                              disabledEdit={disabledRetryAndEditValue}
                              handleEditMessage={handleEditMessage}
                              handleRetryMessage={
                                firstMessageRetry
                                  ? handleFirstMessageRetry
                                  : handleRetryMessage
                              }
                              hidePythonExecution={hidePythonExecution}
                              key={`${message.messageId}::${messageIndex}`}
                              message={message}
                              messageId={message.messageId}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
              {messageExtra}
              {lastMessageContent}
            </Fragment>
          )}
        </div>
      </div>
    );
  },
);
MessageList.displayName = 'MessageList';
