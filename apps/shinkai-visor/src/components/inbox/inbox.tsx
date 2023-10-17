import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  calculateMessageHash,
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  getMessageContent,
  isJobInbox,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendTextMessage/useSendMessageToInbox';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Loader2 } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { cn } from '../../helpers/cn-utils';
import { useAuth } from '../../store/auth/auth';
import { InboxInput } from '../inbox-input/inbox-input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const auth = useAuth((state) => state.auth);
  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isLoading: isChatConversationLoading,
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
    isLoading: isSendingMessageToInbox,
  } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob, isLoading: isSendingMessageToJob } =
    useSendMessageToJob();

  const isSendingMessage = isSendingMessageToJob || isSendingMessageToInbox;
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const previousChatHeightRef = useRef<number>(0);
  const fromPreviousMessagesRef = useRef<boolean>(false);

  const fetchPreviousMessages = useCallback(async () => {
    const firstMessage = data?.pages?.[0]?.[0];
    fromPreviousMessagesRef.current = true;
    if (!firstMessage) return;
    const timeKey = firstMessage?.external_metadata?.scheduled_time;
    const hashKey = calculateMessageHash(firstMessage);
    const firstMessageKey = `${timeKey}:::${hashKey}`;
    await fetchPreviousPage({ pageParam: { lastKey: firstMessageKey } });
  }, [data?.pages, fetchPreviousPage]);
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
  }, [data?.pages]);

  const getAvatar = (message: ShinkaiMessage) => {
    return isLocalMessage(
      message,
      auth?.shinkai_identity || '',
      auth?.profile || ''
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=363636&color=fff'
      : 'https://ui-avatars.com/api/?name=S&background=FE6162&color=fff';
  };
  const submitSendMessage = (value: string) => {
    if (!auth) return;
    fromPreviousMessagesRef.current = false;
    const decodedInboxId = decodeURIComponent(inboxId);
    if (isJobInbox(decodedInboxId)) {
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
  const groupMessagesByDate = (messages: ShinkaiMessage[]) => {
    const groupedMessages: Record<string, ShinkaiMessage[]> = {};
    for (const message of messages) {
      const date = new Date(
        message.external_metadata?.scheduled_time ?? ''
      ).toDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    }
    return groupedMessages;
  };

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      <ScrollArea
        className="[&>div>div]:!block h-full px-5"
        ref={chatContainerRef}
      >
        {isChatConversationSuccess && (
          <div className="py-2 text-center text-xs">
            {isFetchingPreviousPage ? (
              <Loader2 className="flex animate-spin justify-center text-white" />
            ) : (
              <FormattedMessage id="all-messages-loaded"></FormattedMessage>
            )}
          </div>
        )}
        <div className="pb-4">
          {isChatConversationLoading &&
            [1, 2, 3, 4].map((index) => (
              <Skeleton className="h-10 w-full rounded-lg" key={index} />
            ))}
          {isChatConversationSuccess &&
            data?.pages?.map((group, index) => (
              <Fragment key={index}>
                {Object.entries(groupMessagesByDate(group)).map(
                  ([date, messages]) => {
                    return (
                      <div key={date}>
                        <div
                          className={cn(
                            'relative z-10 m-auto flex w-[140px] items-center justify-center rounded-xl bg-secondary-600 shadow-lg transition-opacity',
                            true && 'sticky top-5'
                          )}
                        >
                          <span className="px-2.5 py-2 text-sm font-semibold text-foreground">
                            {date}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4">
                          {messages.map((message, index) => {
                            const isLocal = isLocalMessage(
                              message,
                              auth?.shinkai_identity ?? '',
                              auth?.profile ?? ''
                            );
                            return (
                              <div
                                className={cn(
                                  'flex w-[95%] items-start gap-3',
                                  isLocal
                                    ? 'ml-0 mr-auto flex-row'
                                    : 'ml-auto mr-0 flex-row-reverse'
                                )}
                                key={`${index}-${message.external_metadata?.scheduled_time}`}
                              >
                                <Avatar className="mt-1 h-8 w-8">
                                  <AvatarImage
                                    alt={isLocal ? inboxId : 'Shinkai AI'}
                                    src={getAvatar(message)}
                                  />
                                  <AvatarFallback className="h-8 w-8" />
                                </Avatar>
                                <MarkdownPreview
                                  className={cn(
                                    'mt-1 rounded-lg bg-transparent px-2.5 py-3 text-sm text-foreground',
                                    isLocal
                                      ? 'rounded-tl-none border border-slate-800'
                                      : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]'
                                  )}
                                  source={getMessageContent(message)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </Fragment>
            ))}
        </div>
      </ScrollArea>
      <InboxInput
        disabled={isSendingMessage}
        loading={isSendingMessage}
        onSubmit={(value) => submitSendMessage(value)}
      ></InboxInput>
    </div>
  );
};
