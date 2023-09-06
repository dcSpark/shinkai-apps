import {
  IonBackButton,
  IonButtons,
  IonIcon,
  IonPage,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { sendMessageToJob } from '@shinkai/shinkai-message-ts/api';
import { useSetup } from '../hooks/usetSetup';
import {
  extractJobIdFromInbox,
  getOtherPersonIdentity,
} from '../utils/inbox_name_handler';
import { cn } from '../theme/lib/utils';
import { send } from 'ionicons/icons';
import './Chat.css';
import { IonFooterCustom, IonHeaderCustom } from '../components/ui/Layout';
import ChatMessages from '../components/ChatMessages';
import { RootState } from '../store';

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
    profile
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
        <form
          className={
            'flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative'
          }
          onSubmit={(e) => {
            e.preventDefault();
              sendMessage();
          }}
        >
          <div className="m-2 relative flex h-full flex-1 md:flex-col">
            <IonTextarea
              class="ion-textarea-chat"
              rows={1}
              autoGrow
              fill="outline"
              className="m-0 w-full bg-transparent p-0 pl-2 pr-12 md:pl-0"
              value={inputMessage}
              onIonChange={(e) => {
                const newMessage = e.detail.value!;
                setInputMessage(newMessage);
              }}
              placeholder="Type a message"
            ></IonTextarea>

            <button
              onClick={sendMessage}
              aria-label="Send Message"
              className={cn(
                'absolute z-10 p-3 rounded-md text-gray-500 bottom-[1px] right-1',
                'md:bottom-2.5 md:right-2',
                'hover:bg-gray-100 disabled:hover:bg-transparent',
                'dark:text-white dark:hover:text-gray-100 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent'
              )}
            >
              <IonIcon size="" icon={send} />
            </button>
          </div>
        </form>
      </IonFooterCustom>
    </IonPage>
  );
};

export default JobChat;
