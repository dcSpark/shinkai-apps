import {
  extractJobIdFromInbox,
  getOtherPersonIdentity,
  isJobInbox as checkIsJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetChatConversationBranchesWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversationBranches/useGetChatConversationBranchesWithPagination';
import {
  getRelativeDateLabel,
  groupMessagesByDate,
} from '@shinkai_network/shinkai-node-state/lib/utils/date';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ScrollArea,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Loader2, RotateCcw, Terminal } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { InboxInput } from '../inbox-input/inbox-input';
import { Message } from '../message/message';

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
  } = useGetChatConversationBranchesWithPagination({
    nodeAddress: auth?.node_address ?? '',
    inboxId: decodeURIComponent(inboxId) as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
    // refetchInterval: 5000,
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
        nodeAddress: auth.node_address,
        jobId,
        message: value,
        files_inbox: '',
        parent: '', // Note: we should set the parent if we want to retry or branch out
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const sender = `${auth.shinkai_identity}/${auth.profile}`;
      const receiver_fullname = getOtherPersonIdentity(decodedInboxId, sender);
      const receiver = receiver_fullname.split('/')[0];
      sendMessageToInbox({
        nodeAddress: auth.node_address,
        sender: auth.shinkai_identity,
        sender_subidentity: `${auth.profile}`,
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

  const retrySendMessage = (message: ChatConversationMessage) => {
    console.log('retrySendMessage');
    if (!auth) return;
    const jobId = extractJobIdFromInbox(decodedInboxId);
    sendMessageToJob({
      nodeAddress: auth.node_address,
      jobId,
      // message: 'what is html in 1 one line',
      message: 'what is css in 3 words',
      files_inbox: '',
      parent:
        '57b61385ac57ccdbc3447a8175b7442d7a2fe9aafcbf5203dc9e719411f6db7d',
      // parent:
      // '530f2a9a6107e9918a88f74e69aab8ed12e81aa07cc92569bf2fdac4e463f047',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
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
      <ScrollArea
        className="h-full pr-4 [&>div>div]:!block"
        ref={chatContainerRef}
      >
        {isChatConversationSuccess && (
          <div className="py-2 text-center text-xs text-gray-100">
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
            <div className="flex flex-col space-y-3">
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
                  <Skeleton
                    className="h-12 w-12 shrink-0 rounded-full"
                    key={index}
                  />
                  <Skeleton
                    className={cn(
                      'h-16 w-full rounded-lg px-2.5 py-3',
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
                            {intl.formatMessage({
                              id: getRelativeDateLabel(
                                new Date(messages[0].scheduledTime || ''),
                              ),
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <ChatMessages messages={messages} />
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

function ChatMessages({ messages }: { messages: ChatConversationMessage[] }) {
  console.log(messages, 'messages');
  const [mainThread, setMainThread] = useState<ChatConversationMessage[]>([]);

  useEffect(() => {
    // TODO:  get main thread
    setMainThread(messages);
  }, [messages]);

  return mainThread.map((message, index) => {
    return (
      <div
        className={cn('relative pl-2')}
        data-testid={`message-${message.isLocal ? 'local' : 'remote'}-${
          message.hash
        }`}
        key={`${index}-${message.scheduledTime}`}
      >
        <Message message={message} />
        {message.isLocal && (
          <button className="absolute left-2 top-1/2 -translate-y-1/2 transform rounded-full bg-gray-300">
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Retry</span>
          </button>
        )}
      </div>
    );
  });
}
