import {
  FetchPreviousPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { Fragment, useCallback, useEffect, useRef } from 'react';

import {
  GetChatConversationOutput,
  getRelativeDateLabel,
  groupMessagesByDate,
} from '../../helpers';
import { cn } from '../../utils';
import { ScrollArea } from '../scroll-area';
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
}: {
  noMoreMessageLabel: string;
  isSuccess: boolean;
  isLoading: boolean;
  isFetchingPreviousPage: boolean;
  hasPreviousPage: boolean;
  fromPreviousMessagesRef: React.MutableRefObject<boolean>;
  paginatedMessages:
    | InfiniteData<GetChatConversationOutput, unknown>
    | undefined;
  fetchPreviousPage: (
    options?: FetchPreviousPageOptions | undefined,
  ) => Promise<
    InfiniteQueryObserverResult<
      InfiniteData<GetChatConversationOutput, unknown>,
      Error
    >
  >;
  containerClassName?: string;
}) => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const previousChatHeightRef = useRef<number>(0);

  const fetchPreviousMessages = useCallback(async () => {
    fromPreviousMessagesRef.current = true;
    await fetchPreviousPage();
  }, [fetchPreviousPage]);

  const handleScroll = useCallback(async () => {
    const chatContainerElement = chatContainerRef.current;
    if (!chatContainerElement) return;
    const currentHeight = chatContainerElement.scrollHeight;
    const previousHeight = previousChatHeightRef.current;

    if (chatContainerElement.scrollTop < 100 && hasPreviousPage) {
      await fetchPreviousMessages();
      previousChatHeightRef.current = currentHeight;
      chatContainerElement.scrollTop = currentHeight - previousHeight;
    }
  }, [fetchPreviousMessages, hasPreviousPage]);

  useEffect(() => {
    const chatContainerElement = chatContainerRef.current;
    if (!chatContainerElement) return;
    chatContainerElement.addEventListener('scroll', handleScroll);
    return () => {
      chatContainerElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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

  return (
    <ScrollArea
      className={cn('h-full [&>div>div]:!block', containerClassName)}
      ref={chatContainerRef}
    >
      {isSuccess && (
        <div className="py-2 text-center text-xs text-gray-100">
          {isFetchingPreviousPage && (
            <Loader2 className="flex animate-spin justify-center text-white" />
          )}
          {!isFetchingPreviousPage &&
            !hasPreviousPage &&
            (paginatedMessages?.pages ?? [])?.length > 1 &&
            noMoreMessageLabel}
        </div>
      )}
      <div className="">
        {isLoading && (
          <div className="flex flex-col space-y-3">
            {[...Array(5).keys()].map((index) => (
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
        {isSuccess &&
          paginatedMessages?.pages?.map((group, index) => (
            <Fragment key={index}>
              {Object.entries(groupMessagesByDate(group)).map(
                ([date, messages]) => {
                  return (
                    <div key={date}>
                      <div
                        className={cn(
                          'relative z-10 m-auto my-2 flex h-[26px] w-fit min-w-[100px] items-center justify-center rounded-xl bg-gray-400 px-2.5 capitalize',
                          true && 'sticky top-5',
                        )}
                      >
                        <span className="text-gray-80 text-xs font-medium">
                          {getRelativeDateLabel(
                            new Date(messages[0].scheduledTime || ''),
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        {messages.map((message) => {
                          return (
                            <div
                              data-testid={`message-${
                                message.isLocal ? 'local' : 'remote'
                              }-${message.hash}`}
                              key={`${index}-${message.scheduledTime}`}
                            >
                              <Message message={message} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </Fragment>
          ))}
      </div>
    </ScrollArea>
  );
};
