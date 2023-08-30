/* eslint-disable @typescript-eslint/no-unused-vars */

import './Chat.css';

import {
  IonBackButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSkeletonText,
  IonTextarea,
  IonThumbnail,
  IonTitle,
} from '@ionic/react';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  extractJobIdFromInbox,
  getOtherPersonIdentity,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageWithFilesToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageWithFilesToInbox/useSendMessageWithFilesToInbox';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { send } from 'ionicons/icons';
import { cameraOutline } from 'ionicons/icons';
import { document as documentIcon } from 'ionicons/icons';
import React, { Fragment, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import {
  IonContentCustom,
  IonFooterCustom,
  IonHeaderCustom,
} from '../components/ui/Layout';
import { useAuth } from '../store/auth';

const groupMessagesByDate = (messages: ChatConversationMessage[]) => {
  const groupedMessages: Record<string, ChatConversationMessage[]> = {};
  messages.forEach((message) => {
    const date = new Date(message.scheduledTime ?? '').toDateString();

    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }

    groupedMessages[date].push(message);
  });

  return groupedMessages;
};

const JobChat: React.FC = () => {
  const auth = useAuth((state) => state.auth);
  if (!auth) throw new Error('Auth is null');

  const { id } = useParams<{ id: string }>();
  const deserializedId = decodeURIComponent(id).replace(/~/g, '.');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileExtension, setFileExtension] = useState<string | null>(null);
  const otherPersonIdentity = getOtherPersonIdentity(
    deserializedId,
    auth?.shinkai_identity ?? '',
  );

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isLoading: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
    nodeAddress: auth.node_address,
    inboxId: deserializedId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const [isScrolling, setScrolling] = useState(true);

  const chatContainerRef = React.createRef<HTMLIonContentElement>();

  React.useEffect(() => {
    const loadScroll = async () => {
      const handleScroll = () => {
        setScrolling(true);
      };
      const handleScrollEnd = () => {
        setTimeout(() => {
          setScrolling(false);
        }, 2000);
      };
      if (chatContainerRef.current) {
        const scrollElement = await chatContainerRef.current.getScrollElement();
        scrollElement.addEventListener('scroll', handleScroll);
        scrollElement.addEventListener('scrollend', handleScrollEnd);
        return () => {
          scrollElement.removeEventListener('scroll', handleScroll);
          scrollElement.removeEventListener('scrollend', handleScrollEnd);
        };
      }
    };
    loadScroll();
  }, [chatContainerRef]);

  const getAvatar = (message: ShinkaiMessage) => {
    return isLocalMessage(
      message,
      auth?.shinkai_identity || '',
      auth?.profile || '',
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
      : 'https://ui-avatars.com/api/?name=S&background=363636&color=fff';
  };

  const {
    mutateAsync: sendMessageToJob,
    isPending: isSendingMessageToJob,
    isSuccess: isMessageToJobSuccess,
  } = useSendMessageToJob();

  const {
    mutateAsync: sendTextMessageWithFilesForInbox,
    isPending: isSendingTextMessageWithFilesForInbox,
    isSuccess: isTextMessageWithFilesForInboxSuccess,
  } = useSendMessageWithFilesToInbox();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      const ext = event.target.files[0].name.split('.').pop() || null;
      setFileExtension(ext);
    }
  };

  const sendMessage = useCallback(async () => {
    if (inputMessage.trim() === '') return;

    const message_to_send = inputMessage;
    setInputMessage('');
    setSelectedFile(null);

    if (selectedFile) {
      await sendTextMessageWithFilesForInbox({
        nodeAddress: auth.node_address,
        sender: auth.shinkai_identity,
        senderSubidentity: auth.profile,
        receiver: auth.shinkai_identity,
        message: message_to_send,
        inboxId: deserializedId as string,
        files: [selectedFile],
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const jobId = extractJobIdFromInbox(deserializedId);
      await sendMessageToJob({
        nodeAddress: auth.node_address,
        jobId: jobId,
        message: message_to_send,
        files_inbox: '',
        parent: '', // Note: this should be defined if we want to retry or branch out
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
  }, [
    inputMessage,
    auth.shinkai_identity,
    auth.profile,
    auth.my_device_encryption_sk,
    auth.my_device_identity_sk,
    auth.node_encryption_pk,
    auth.profile_encryption_sk,
    auth.profile_identity_sk,
    selectedFile,
    sendTextMessageWithFilesForInbox,
    deserializedId,
    sendMessageToJob,
  ]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLIonTextareaElement>,
  ) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      sendMessage();
    }
  };

  const scrollToBottom = useCallback(async () => {
    if (chatContainerRef.current) {
      const scrollElement = await chatContainerRef.current.getScrollElement();
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [chatContainerRef]);

  React.useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTextMessageWithFilesForInboxSuccess, isMessageToJobSuccess]);

  return (
    <IonPage className="bg-slate-900">
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <div className="flex gap-4 px-4">
          <IonTitle className="text-accent w-auto text-center text-inherit">
            {otherPersonIdentity}
          </IonTitle>
          {/*<Avatar className="shrink-0" />*/}
        </div>
      </IonHeaderCustom>
      <IonContentCustom ref={chatContainerRef}>
        <div className="bg-white dark:bg-slate-900">
          <IonList class="ion-list-chat flex flex-col gap-10 bg-transparent p-0 md:rounded-[1.25rem]">
            {isChatConversationLoading &&
              Array.from({ length: 4 }).map((item, idx) => (
                <IonItem
                  className={cn(
                    'ion-item-chat relative',
                    idx % 2 === 1 && 'isLocalMessage',
                  )}
                  key={idx}
                  lines="none"
                >
                  <div className="flex w-full gap-4 px-2 py-4 pb-10">
                    <IonThumbnail className={'rounded-[1.5rem]'} slot="start">
                      <IonSkeletonText
                        animated={true}
                        className={'rounded-[8px]'}
                      />
                    </IonThumbnail>
                    <div className="w-full">
                      <IonSkeletonText
                        animated={true}
                        style={{
                          width: '90%',
                          borderRadius: '1.5rem',
                          marginBottom: 13,
                        }}
                      />
                      <IonSkeletonText
                        animated={true}
                        style={{
                          width: '80%',
                          borderRadius: '1.5rem',
                        }}
                      />
                    </div>
                  </div>
                </IonItem>
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
                              'relative z-10 m-auto flex w-[140px] items-center justify-center rounded-xl bg-white shadow-lg transition-opacity dark:bg-slate-800',
                              isScrolling && 'sticky top-5',
                            )}
                          >
                            <span className="text-foreground px-2.5 py-2 text-sm font-semibold">
                              {date}
                            </span>
                          </div>
                          <div className="flex flex-col gap-4 py-10 md:gap-8">
                            {messages.map((message, idx) => {
                              return (
                                <IonItem
                                  className={cn(
                                    'ion-item-chat relative',
                                    message.isLocal && 'isLocalMessage',
                                  )}
                                  key={message.scheduledTime}
                                  lines="none"
                                >
                                  <div
                                    className={cn(
                                      'flex gap-2 px-2 py-6 pb-14 md:gap-8',
                                      message.isLocal
                                        ? 'ml-auto flex-row-reverse'
                                        : 'mr-auto',
                                    )}
                                  >
                                    <Avatar
                                      className="shrink-0"
                                      url={message.sender.avatar}
                                    />
                                    <MarkdownPreview
                                      className={cn(
                                        'text-foreground mt-1 rounded-lg bg-transparent px-2.5 py-3 text-sm',
                                        message.isLocal
                                          ? 'rounded-tl-none border border-slate-800'
                                          : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]',
                                      )}
                                      source={message.content}
                                    />{' '}
                                  </div>
                                </IonItem>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  )}
                </Fragment>
              ))}
          </IonList>
        </div>
      </IonContentCustom>
      <IonFooterCustom>
        <div className={'w-full py-2 md:py-3 md:pl-4'}>
          <div className="m-2 flex h-full items-end rounded-xl border border-slate-300 pr-2 shadow">
            {selectedFile && (
              <div className="flex flex-col items-center justify-center gap-1 px-3">
                <IonIcon icon={documentIcon} />
                <IonLabel className="text-xs">{fileExtension}</IonLabel>
              </div>
            )}
            <IonTextarea
              autoGrow
              class="ion-textarea-chat"
              className="m-0 w-full bg-transparent p-0 pl-3 pr-12"
              onIonInput={(e) => {
                const newMessage = e.detail.value as string;
                setInputMessage(newMessage);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              value={inputMessage}
            />

            <input hidden onChange={handleFileChange} type="file" />

            <button
              aria-label="Add File"
              className={cn(
                'mb-2 mr-2 h-10 w-10 rounded-md text-gray-500',
                'bg-brand-500 hover:bg-brand-500/80 disabled:hover:bg-transparent',
                'dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent',
              )}
              onClick={() =>
                (
                  document.querySelector(
                    'input[type="file"]',
                  ) as HTMLInputElement
                )?.click()
              }
            >
              <IonIcon icon={cameraOutline} size="" />
            </button>

            <button
              aria-label="Send Message"
              className={cn(
                'mb-2 h-10 w-10 rounded-md text-gray-500',
                'bg-brand-500 hover:bg-brand-500/80 disabled:hover:bg-transparent',
                'dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent',
              )}
              onClick={sendMessage}
            >
              <IonIcon className={'text-white'} icon={send} size="" />
            </button>
          </div>
        </div>
      </IonFooterCustom>
    </IonPage>
  );
};

export default JobChat;
