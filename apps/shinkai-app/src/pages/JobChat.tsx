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
  getMessageContent,
  getOtherPersonIdentity,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageWithFilesToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageWithFilesToInbox/useSendMessageWithFilesToInbox';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
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
import { useSetup } from '../hooks/usetSetup';
import { useAuth } from '../store/auth';
import { cn } from '../theme/lib/utils';

const groupMessagesByDate = (messages: ShinkaiMessage[]) => {
  const groupedMessages: Record<string, ShinkaiMessage[]> = {};
  messages.forEach((message) => {
    const date = new Date(
      message.external_metadata?.scheduled_time ?? ''
    ).toDateString();

    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }

    groupedMessages[date].push(message);
  });

  return groupedMessages;
};

const JobChat: React.FC = () => {
  useSetup();

  const auth = useAuth((state) => state.auth);
  if (!auth) throw new Error('Auth is null');

  const { id } = useParams<{ id: string }>();
  const deserializedId = decodeURIComponent(id).replace(/~/g, '.');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileExtension, setFileExtension] = useState<string | null>(null);
  const otherPersonIdentity = getOtherPersonIdentity(
    deserializedId,
    auth?.shinkai_identity ?? ''
  );

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isLoading: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
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
      auth?.profile || ''
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
      : 'https://ui-avatars.com/api/?name=S&background=363636&color=fff';
  };

  const {
    mutateAsync: sendMessageToJob,
    isLoading: isSendingMessageToJob,
    isSuccess: isMessageToJobSuccess,
  } = useSendMessageToJob();

  const {
    mutateAsync: sendTextMessageWithFilesForInbox,
    isLoading: isSendingTextMessageWithFilesForInbox,
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
        sender: auth.shinkai_identity,
        senderSubidentity: auth.profile,
        receiver: auth.shinkai_identity,
        message: message_to_send,
        inboxId: deserializedId as string,
        file: selectedFile,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const jobId = extractJobIdFromInbox(deserializedId);
      await sendMessageToJob({
        jobId: jobId,
        message: message_to_send,
        files_inbox: '',
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
    event: React.KeyboardEvent<HTMLIonTextareaElement>
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
          <IonTitle className="w-auto text-accent text-center text-inherit">
            {otherPersonIdentity}
          </IonTitle>
          {/*<Avatar className="shrink-0" />*/}
        </div>
      </IonHeaderCustom>
      <IonContentCustom ref={chatContainerRef}>
        <div className="bg-white dark:bg-slate-900">
          <IonList class="ion-list-chat flex flex-col gap-10 p-0 md:rounded-[1.25rem] bg-transparent">
            {isChatConversationLoading &&
              Array.from({ length: 4 }).map((item, idx) => (
                <IonItem
                  className={cn(
                    'ion-item-chat relative',
                    idx % 2 === 1 && 'isLocalMessage'
                  )}
                  key={idx}
                  lines="none"
                >
                  <div className="px-2 py-4 flex gap-4 pb-10 w-full">
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
                              'relative z-10 m-auto flex w-[140px] items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-lg transition-opacity',
                              isScrolling && 'sticky top-5'
                            )}
                          >
                            <span className="px-2.5 py-2 text-sm font-semibold text-foreground">
                              {date}
                            </span>
                          </div>
                          <div className="flex flex-col gap-4 md:gap-8 py-10">
                            {messages.map((message, idx) => {
                              const isLocal = isLocalMessage(
                                message,
                                auth?.shinkai_identity ?? '',
                                auth?.profile ?? ''
                              );
                              return (
                                <IonItem
                                  className={cn(
                                    'ion-item-chat relative',
                                    isLocal && 'isLocalMessage'
                                  )}
                                  key={
                                    message?.external_metadata?.scheduled_time
                                  }
                                  lines="none"
                                >
                                  <div
                                    className={cn(
                                      'px-2 py-6 flex gap-2 md:gap-8 pb-14',
                                      isLocal
                                        ? 'flex-row-reverse ml-auto'
                                        : 'mr-auto'
                                    )}
                                  >
                                    <Avatar
                                      className="shrink-0"
                                      url={getAvatar(message)}
                                    />
                                    <MarkdownPreview
                                      className={cn(
                                        'mt-1 rounded-lg bg-transparent px-2.5 py-3 text-sm text-foreground',
                                        isLocal
                                          ? 'rounded-tl-none border border-slate-800'
                                          : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]'
                                      )}
                                      source={getMessageContent(message)}
                                    />{' '}
                                  </div>
                                </IonItem>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </Fragment>
              ))}
          </IonList>
        </div>
      </IonContentCustom>
      <IonFooterCustom>
        <div className={'w-full py-2 md:py-3 md:pl-4'}>
          <div className="m-2 flex items-end h-full border border-slate-300 pr-2 rounded-xl shadow">
            {selectedFile && (
              <div className="px-3 flex flex-col gap-1 justify-center items-center">
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
                'h-10 w-10 rounded-md text-gray-500 mb-2 mr-2',
                'bg-brand-500 hover:bg-brand-500/80 disabled:hover:bg-transparent',
                'dark:text-white dark:hover:text-gray-100 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent'
              )}
              onClick={() =>
                (
                  document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement
                )?.click()
              }
            >
              <IonIcon icon={cameraOutline} size="" />
            </button>

            <button
              aria-label="Send Message"
              className={cn(
                'h-10 w-10 rounded-md text-gray-500 mb-2',
                'bg-brand-500 hover:bg-brand-500/80 disabled:hover:bg-transparent',
                'dark:text-white dark:hover:text-gray-100 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent'
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
