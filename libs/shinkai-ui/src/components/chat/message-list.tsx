import { ChatConversationInfiniteData } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import {
  FetchPreviousPageOptions,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
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
import { Button } from '../button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';
import { Label } from '../label';
import { RadioGroup, RadioGroupItem } from '../radio-group';
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
  disabledRetryAndEdit,
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
  regenerateMessage?: (
    content: string,
    messageHash: string,
    workflowName?: string,
  ) => void;
  containerClassName?: string;
  lastMessageContent: string;
  isLoadingMessage: boolean | undefined;
  disabledRetryAndEdit?: boolean;
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

                        const disabledRetryAndEditValue =
                          disabledRetryAndEdit ??
                          (grandparentHash === null || grandparentHash === '');

                        const handleRetryMessage = () => {
                          regenerateMessage?.(
                            previousMessage.content,
                            grandparentHash ?? '',
                            previousMessage.workflowName,
                          );
                        };
                        const handleEditMessage = (
                          message: string,
                          workflowName?: string,
                        ) => {
                          regenerateMessage?.(
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
                              disabledEdit={disabledRetryAndEditValue}
                              disabledRetry={disabledRetryAndEditValue}
                              handleEditMessage={handleEditMessage}
                              handleRetryMessage={handleRetryMessage}
                              message={message}
                            />
                            {messageIndex === messages.length - 1 && (
                              <MessageExtra
                                metadata={{
                                  amount: 100,
                                  currency: 'USD',
                                }}
                                name="payment"
                              />
                            )}
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

// if its name is payment, then render a payment component

function MessageExtra({
  name,
  metadata,
}: {
  name: string;
  metadata: Record<string, any>;
}) {
  if (name === 'payment') {
    return <Payment amount={metadata.amount} currency={metadata.currency} />;
  }
  return null;
}

function Payment({ amount, currency }: { amount: number; currency: string }) {
  const [selectedPlan, setSelectedPlan] = React.useState<
    'one-time' | 'download' | 'both'
  >('one-time');

  const [status, setStatus] = React.useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  const handleConfirmPayment = () => {
    setStatus('pending');
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="-mt-7 mb-4 ml-10 min-h-[250px] max-w-4xl rounded-xl border border-gray-300 p-1"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mx-auto max-w-xl border-0">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="idle"
              transition={{ duration: 0.2 }}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-center text-lg font-semibold">
                  YouTube Transcript
                </CardTitle>
                <CardDescription className="text-center text-xs">
                  Elevate your YouTube experience with the ultimate transcript
                  viewer plugin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
                  className="grid grid-cols-2 gap-4"
                  onValueChange={(value) =>
                    setSelectedPlan(value as 'one-time' | 'download' | 'both')
                  }
                  value={selectedPlan}
                >
                  <div className="relative">
                    <RadioGroupItem
                      className="peer sr-only"
                      id="one-time"
                      value="one-time"
                    />
                    <Label
                      className="hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand flex w-full flex-col items-center justify-between rounded-md border-2 border-gray-400 bg-gray-500 p-4"
                      htmlFor="one-time"
                    >
                      <span className="text-2xl font-semibold">$9.99</span>
                      <span className="text-gray-100">one-time use</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem
                      className="peer sr-only"
                      id="download"
                      value="download"
                    />
                    <Label
                      className="hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand flex w-full flex-col items-center justify-between rounded-md border-2 border-gray-400 bg-gray-500 p-4"
                      htmlFor="download"
                    >
                      <span className="text-2xl font-semibold">$99.99</span>
                      <span className="text-gray-100">for download</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </motion.div>
          )}

          {status === 'pending' && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="pending"
              transition={{ duration: 0.2 }}
            >
              <CardContent className="mt-16 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="text-gray-80 ml-2">Processing payment...</span>
              </CardContent>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key="success"
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <span className="mt-4 text-lg font-semibold text-white">
                    Payment Successful!
                  </span>
                  <span className="mt-2 text-sm text-gray-100">
                    Thank you for your purchase.
                  </span>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
        <CardFooter className="flex justify-center">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                key="idle-button"
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="mx-auto min-w-[200px] rounded-md"
                  onClick={handleConfirmPayment}
                  size="sm"
                >
                  Confirm Payment
                </Button>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                key="success-button"
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="mx-auto min-w-[200px] rounded-md"
                  onClick={() => {
                    setStatus('idle');
                  }}
                  size="sm"
                >
                  Try it out!
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
