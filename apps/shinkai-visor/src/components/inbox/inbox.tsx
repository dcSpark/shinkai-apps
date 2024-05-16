import {
  extractErrorPropertyOrContent,
  extractJobIdFromInbox,
  getOtherPersonIdentity,
  isJobInbox as checkIsJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  MessageList,
} from '@shinkai_network/shinkai-ui';
import { AlertCircle, Terminal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { InboxInput } from '../inbox-input/inbox-input';

enum ErrorCodes {
  VectorResource = 'VectorResource',
  ShinkaiBackendInferenceLimitReached = 'ShinkaiBackendInferenceLimitReached',
}

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const auth = useAuth((state) => state.auth);
  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isPending: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
    nodeAddress: auth?.node_address ?? '',
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
  const fromPreviousMessagesRef = useRef<boolean>(false);
  const [decodedInboxId, setDecodedInboxId] = useState<string>('');
  const [isJobInbox, setIsJobInbox] = useState<boolean>(false);
  const [isJobProcessing, setIsJobProcessing] = useState<boolean>(false);
  const [isJobProcessingFile, setIsJobProcessingFile] =
    useState<boolean>(false);

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

  const isLimitReachedErrorLastMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (!lastMessage) return;
    const errorCode = extractErrorPropertyOrContent(
      lastMessage.content,
      'error',
    );
    return errorCode === ErrorCodes.ShinkaiBackendInferenceLimitReached;
  }, [data?.pages]);

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <MessageList
        containerClassName="pr-4"
        fetchPreviousPage={fetchPreviousPage}
        fromPreviousMessagesRef={fromPreviousMessagesRef}
        hasPreviousPage={hasPreviousPage}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isLoading={isChatConversationLoading}
        isSuccess={isChatConversationSuccess}
        noMoreMessageLabel="All messages has been loaded ✅"
        paginatedMessages={data}
      />
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
      {isLimitReachedErrorLastMessage && (
        <Alert className="shadow-lg" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">
            <FormattedMessage id="limit-reached" />
          </AlertTitle>
          <AlertDescription className="text-gray-80 text-xs">
            <div className="flex flex-row items-center space-x-2">
              <FormattedMessage id="limit-reached-description" />
            </div>
          </AlertDescription>
        </Alert>
      )}
      {!isLimitReachedErrorLastMessage && (
        <InboxInput
          disabled={isSendingMessage || isLimitReachedErrorLastMessage}
          loading={isJobProcessing}
          onSubmit={(value) => submitSendMessage(value)}
        />
      )}
    </div>
  );
};
