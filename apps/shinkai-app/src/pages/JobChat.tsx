import './Chat.css';

import {
  IonBackButton,
  IonButtons,
  IonIcon,
  IonPage,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import { sendMessageToJob } from '@shinkai_network/shinkai-message-ts/api';
import { send } from 'ionicons/icons';
import React, { useCallback, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import ChatMessages from '../components/ChatMessages';
import { IonFooterCustom, IonHeaderCustom } from '../components/ui/Layout';
import { useSetup } from '../hooks/usetSetup';
import { RootState } from '../store';
import { cn } from '../theme/lib/utils';
import {
  extractJobIdFromInbox,
  getOtherPersonIdentity,
} from '../utils/inbox_name_handler';

const JobChat: React.FC = () => {
  console.log('Loading JobChat.tsx');
  useSetup();

  const dispatch = useDispatch();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetails,
    shallowEqual
  );
  const { shinkai_identity, profile } = setupDetailsState;

  const { id } = useParams<{ id: string }>();
  const deserializedId = decodeURIComponent(id).replace(/~/g, '.');
  const [inputMessage, setInputMessage] = useState('');
  const otherPersonIdentity = getOtherPersonIdentity(
    deserializedId,
    setupDetailsState.shinkai_identity
  );

  const sendMessage = useCallback(async () => {
    if (inputMessage.trim() === '') return;
    const sender = `${shinkai_identity}/${profile}`;
    console.log('Sending message: ', inputMessage);
    console.log('Sender:', sender);

    const message_to_send = inputMessage;
    setInputMessage('');
    sendMessageToJob(
      extractJobIdFromInbox(deserializedId.toString()),
      message_to_send,
      sender,
      shinkai_identity,
      '',
      setupDetailsState
    ).then((message) => {
      dispatch({ type: 'SEND_MESSAGE_SUCCESS', payload: message });
    });
  }, [
    inputMessage,
    dispatch,
    setupDetailsState,
    shinkai_identity,
    deserializedId,
    profile,
  ]);

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
            <IonTextarea
              autoGrow
              class="ion-textarea-chat"
              className="m-0 w-full bg-transparent p-0 pl-2 pr-12 md:pl-0"
              onIonInput={(e) => {
                const newMessage = e.detail.value as string;
                setInputMessage(newMessage);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  void sendMessage();
                }
              }}
              placeholder="Type a message"
              value={inputMessage}
            />

            <button
              aria-label="Send Message"
              className={cn(
                'h-10 w-10 rounded-md text-gray-500 mb-2',
                'bg-[#FE6162] hover:bg-[#FE6162]/80 disabled:hover:bg-transparent',
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
