import './Chat.css';

import {
  IonBackButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonPage,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import {
  extractJobIdFromInbox,
  getOtherPersonIdentity,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageWithFilesToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageWithFilesToInbox';
import { send } from 'ionicons/icons';
import { cameraOutline } from 'ionicons/icons';
import { document as documentIcon } from 'ionicons/icons';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import ChatMessages from '../components/ChatMessages';
import { IonFooterCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useSetup } from '../hooks/usetSetup';
import { useAuth } from '../store/auth';
import { cn } from '../theme/lib/utils';

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

  const { mutateAsync: sendMessageToJob, isLoading: isSendingMessageToJob } =
    useSendMessageToJob();

  const {
    mutateAsync: sendTextMessageWithFilesForInbox,
    isLoading: isSendingTextMessageWithFilesForInbox,
  } = useSendMessageWithFilesToInbox();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      const ext = event.target.files[0].name.split('.').pop() || null;
      setFileExtension(ext);
    }
  };

  const sendMessage = useCallback(async () => {
    console.log('Sending message: ', inputMessage);
    if (inputMessage.trim() === '') return;

    const message_to_send = inputMessage;
    setInputMessage('');
    setSelectedFile(null);
    const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;

    if (selectedFile) {
      sendTextMessageWithFilesForInbox({
        file: selectedFile,
        message: message_to_send,
        sender,
        receiver: sender,
        inboxId: deserializedId as string,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const jobId = extractJobIdFromInbox(deserializedId);

      sendMessageToJob({
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
    auth.registration_name,
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
      <ChatMessages deserializedId={deserializedId} />
      <IonFooterCustom>
        <div className={'w-full py-2 md:py-3 md:pl-4'}>
          <div className="m-2 flex items-end h-full border border-slate-300 pr-2 rounded-xl shadow">
            {selectedFile && (
              <div className="flex items-center">
                <IonIcon icon={documentIcon} />
                <IonLabel>{fileExtension}</IonLabel>
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
