import {
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox as checkIsJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import { Loader2, Terminal } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { cn } from '../../helpers/cn-utils';
import { useAuth } from '../../store/auth/auth';
import { InboxInput } from '../inbox-input/inbox-input';
import { Message } from '../message/message';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import DotsLoader from '../ui/dots-loader';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const auth = useAuth((state) => state.auth);
  const intl = useIntl();
  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isPending: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
    inboxId: decodeURIComponent(inboxId) as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
    refetchInterval: 5000,
  });
  const {
    mutateAsync: sendMessageToInbox,
    isPending: isSendingMessageToInbox,
  } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob, isPending: isSendingMessageToJob } =
    useSendMessageToJob();
  const isSendingMessage = isSendingMessageToJob || isSendingMessageToInbox;
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const previousChatHeightRef = useRef<number>(0);
  const fromPreviousMessagesRef = useRef<boolean>(false);
  const [decodedInboxId, setDecodedInboxId] = useState<string>('');
  const [isJobInbox, setIsJobInbox] = useState<boolean>(false);
  const [isJobProcessing, setIsJobProcessing] = useState<boolean>(false);
  const [isJobProcessingFile, setIsJobProcessingFile] =
    useState<boolean>(false);
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
  const scrollToBottom = () => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };
  const submitSendMessage = (value: string) => {
    if (!auth) return;
    fromPreviousMessagesRef.current = false;
    if (isJobInbox) {
      const jobId = extractJobIdFromInbox(decodedInboxId);
      sendMessageToJob({
        jobId,
        message: value,
        files_inbox: '',
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
      const receiver = extractReceiverShinkaiName(decodedInboxId, sender);
      sendMessageToInbox({
        sender: auth.shinkai_identity,
        sender_subidentity: `${auth.profile}/device/${auth.registration_name}`,
        receiver,
        message: value,
        inboxId: decodedInboxId,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
  };
  const groupMessagesByDate = (messages: ChatConversationMessage[]) => {
    const groupedMessages: Record<string, ChatConversationMessage[]> = {};
    for (const message of messages) {
      const date = new Date(message.scheduledTime ?? '').toDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    }
    return groupedMessages;
  };
  const dateToLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return intl.formatMessage({ id: 'today' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return intl.formatMessage({ id: 'yesterday' });
    } else {
      return date.toDateString();
    }
  };
  useEffect(() => {
    const chatContainerElement = chatContainerRef.current;
    if (!chatContainerElement) return;
    chatContainerElement.addEventListener('scroll', handleScroll);
    return () => {
      chatContainerElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  useEffect(() => {
    if (inboxId) {
      setDecodedInboxId(decodeURIComponent(inboxId));
    }
  }, [inboxId]);
  useEffect(() => {
    if (decodedInboxId) {
      setIsJobInbox(checkIsJobInbox(decodedInboxId));
    }
  }, [decodedInboxId]);

  useEffect(() => {
    if (!fromPreviousMessagesRef.current) {
      scrollToBottom();
    }
  }, [data?.pages]);
  useEffect(() => {
    const [firstMessagePage] = data?.pages || [];
    const lastMessage = [...(firstMessagePage || [])].pop();
    if (lastMessage) {
      setIsJobProcessing(
        isJobInbox && (isSendingMessage || lastMessage.isLocal),
      );
    }
  }, [data?.pages, auth, isSendingMessage, isJobInbox]);
  useEffect(() => {
    const [firstMessagePage] = data?.pages || [];
    const lastMessage = [...(firstMessagePage || [])].pop();
    if (lastMessage) {
      setIsJobProcessingFile(
        isJobProcessing && lastMessage.isLocal && !!lastMessage.fileInbox,
      );
    }
  }, [data?.pages, auth, isJobProcessing]);

  return (
    <div className="flex h-full flex-col justify-between space-y-3">
      <ScrollArea className="h-full pr-4 [&>div>div]:!block" ref={chatContainerRef}>
        {isChatConversationSuccess && (
          <div className="py-2 text-center text-xs">
            {isFetchingPreviousPage && (
              <Loader2 className="flex animate-spin justify-center text-white" />
            )}
            {!isFetchingPreviousPage && !hasPreviousPage && (
              <FormattedMessage id="all-messages-loaded" />
            )}
          </div>
        )}
        <div className="">
          {isChatConversationLoading && (
            <div className="flex flex-col space-y-2">
              {[...Array(5).keys()].map((index) => (
                <div
                  className={cn(
                    'flex w-[95%] items-start gap-3',
                    index % 2 === 0
                      ? 'ml-0 mr-auto flex-row'
                      : 'ml-auto mr-0 flex-row-reverse',
                  )}
                  key={`${index}`}
                >
                  <Skeleton className="shrink-0 h-12 w-12 rounded-full" key={index} />
                  <Skeleton
                    className={cn(
                      'w-full h-16 rounded-lg px-2.5 py-3',
                      index % 2 === 0
                        ? 'rounded-tl-none border border-slate-800'
                        : 'rounded-tr-none border-none',
                    )}
                  />
                </div>
              ))}
            </div>
          )}
          {isChatConversationSuccess &&
            data?.pages?.map((group, index) => (
              <Fragment key={index}>
                {Object.entries(groupMessagesByDate(group)).map(
                  ([date, messages]) => {
                    return (
                      <div key={date}>
                        <div
                          className={cn(
                            'relative z-10 m-auto flex h-[30px] w-[150px] items-center justify-center rounded-xl bg-gray-400',
                            true && 'sticky top-5',
                          )}
                        >
                          <span className="text-sm font-medium text-gray-100">
                            {dateToLabel(
                              new Date(messages[0].scheduledTime || ''),
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4">
                          {messages.map((message) => {
                            return (
                              <div
                                className={cn('pl-2')}
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
      {isJobProcessingFile && (
        <Alert className="shadow-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle className="text-sm">
            <FormattedMessage id="file-processing-alert-title" />
          </AlertTitle>
          <AlertDescription className="text-xs">
            <div className="flex flex-row items-center space-x-2">
              <span>
                <FormattedMessage id="file-processing-alert-description" />
              </span>
              <DotsLoader className="h-full w-6" />
            </div>
          </AlertDescription>
          <Terminal className="h-4 w-4" />
        </Alert>
      )}
      <InboxInput
        disabled={isSendingMessage}
        loading={isJobProcessing}
        onSubmit={(value) => submitSendMessage(value)}
      />
    </div>
  );
};
