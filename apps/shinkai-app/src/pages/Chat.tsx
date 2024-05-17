/* eslint-disable @typescript-eslint/no-unused-vars */

import './Chat.css';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IonBackButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { useSendMessageWithFilesToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageWithFilesToInbox/useSendMessageWithFilesToInbox';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import { groupMessagesByDate } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { cameraOutline } from 'ionicons/icons';
import { send } from 'ionicons/icons';
import React, { Fragment } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import z from 'zod';

import Avatar from '../components/ui/Avatar';
import {
  IonContentCustom,
  IonFooterCustom,
  IonHeaderCustom,
} from '../components/ui/Layout';
import { useAuth } from '../store/auth';
import {
  extractReceiverShinkaiName,
  getOtherPersonIdentity,
} from '../utils/inbox_name_handler';

const chatSchema = z.object({
  message: z.string(),
  file: z.any().optional(),
});

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth((state) => state.auth);
  const deserializedId = decodeURIComponent(id).replace(/~/g, '.');

  const chatForm = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: '',
    },
  });
  const { file } = chatForm.watch();

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isPending: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
    nodeAddress: auth?.node_address ?? '',
    inboxId: deserializedId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const {
    mutateAsync: sendMessageToInbox,
    isPending: isSendingMessageToInbox,
  } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob, isPending: isSendingMessageToJob } =
    useSendMessageToJob();

  const {
    mutateAsync: sendTextMessageWithFilesForInbox,
    isPending: isSendingTextMessageWithFilesForInbox,
  } = useSendMessageWithFilesToInbox();

  const otherPersonIdentity = getOtherPersonIdentity(
    deserializedId,
    auth?.shinkai_identity ?? '',
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log(event.target.files[0], 'event.target.files[0]');
      chatForm.setValue('file', event.target.files[0] as File);
    }
  };

  const onSubmit = async (data: z.infer<typeof chatSchema>) => {
    if (!auth) return;
    const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
    const receiver = extractReceiverShinkaiName(deserializedId, sender);

    if (file) {
      await sendTextMessageWithFilesForInbox({
        nodeAddress: auth.node_address,
        sender: auth.shinkai_identity,
        senderSubidentity: auth.profile,
        receiver,
        message: data.message,
        inboxId: deserializedId as string,
        files: [file],
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      await sendMessageToInbox({
        nodeAddress: auth.node_address,
        sender: auth.shinkai_identity,
        sender_subidentity: auth.profile,
        receiver,
        message: data.message,
        inboxId: deserializedId as string,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
    chatForm.reset();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLIonTextareaElement>,
  ) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      chatForm.handleSubmit(onSubmit);
    }
  };

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

      <IonContentCustom>
        <div className="bg-white dark:bg-slate-900">
          <IonList class="ion-list-chat flex flex-col gap-10 bg-transparent p-0 md:rounded-[1.25rem]">
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
                              true && 'sticky top-5',
                            )}
                          >
                            <span className="text-foreground px-2.5 py-2 text-sm font-semibold">
                              {date}
                            </span>
                          </div>
                          <div className="flex flex-col gap-4">
                            {messages.map((message) => {
                              return (
                                <IonItem
                                  className={cn(
                                    'ion-item-chat relative',
                                    message.isLocal && 'isLocalMessage',
                                  )}
                                  key={index}
                                  lines="none"
                                >
                                  <div className="flex w-full gap-4 px-2 py-4 pb-10">
                                    <Avatar
                                      className="mr-4 shrink-0"
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
                                    />
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
            {file && (
              <img
                alt="Selected"
                className="h-20 w-auto"
                src={URL.createObjectURL(file)}
              />
            )}
            <Controller
              control={chatForm.control}
              name="file"
              render={({ field }) => (
                <div>
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

                  <input hidden onChange={handleFileChange} type="file" />
                </div>
              )}
            />

            <Controller
              control={chatForm.control}
              name="message"
              render={({ field }) => (
                <IonTextarea
                  autoGrow
                  class="ion-textarea-chat"
                  className="m-0 w-full bg-transparent p-0 pl-3 pr-12"
                  onIonInput={(e) => {
                    const newMessage = e.detail.value as string;
                    chatForm.setValue('message', newMessage);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  value={field.value}
                />
              )}
            />

            <button
              aria-label="Send Message"
              className={cn(
                'mb-2 h-10 w-10 rounded-md text-gray-500',
                'bg-brand-500 hover:bg-brand-500/80 disabled:hover:bg-transparent',
                'dark:text-white dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:hover:bg-transparent',
              )}
              onClick={chatForm.handleSubmit(onSubmit)}
            >
              <IonIcon icon={send} size="" />
            </button>
          </div>
        </div>
      </IonFooterCustom>
    </IonPage>
  );
};

export default Chat;
