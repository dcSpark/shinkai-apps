import './Chat.css';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
  IonTextarea,
  IonTitle,
} from '@ionic/react';
import { IonInput } from '@ionic/react';
import {
  getLastMessagesFromInbox,
  sendTextMessageWithFilesForInbox,
  sendTextMessageWithInbox,
} from '@shinkai_network/shinkai-message-ts/api';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import { calculateMessageHash } from '@shinkai_network/shinkai-message-ts/utils';
import { cameraOutline } from 'ionicons/icons';
import { send } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import {
  IonContentCustom,
  IonFooterCustom,
  IonHeaderCustom,
} from '../components/ui/Layout';
import { useSetup } from '../hooks/usetSetup';
import { RootState } from '../store';
import {
  addMessageToInbox,
  receiveLastMessagesFromInbox,
  receiveLoadMoreMessagesFromInbox,
} from '../store/actions';
import { RECEIVE_LAST_MESSAGES_FROM_INBOX } from '../store/types';
import { cn } from '../theme/lib/utils';
import {
  extractReceiverShinkaiName,
  getOtherPersonIdentity,
} from '../utils/inbox_name_handler';

const parseDate = (dateString: string) => {
  return new Date(dateString);
};

const Chat: React.FC = () => {
  console.log('Loading Chat.tsx');
  useSetup();

  const dispatch = useDispatch();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetails
  );

  const { id } = useParams<{ id: string }>();
  const bottomChatRef = useRef<HTMLDivElement>(null);
  const deserializedId = decodeURIComponent(id).replace(/~/g, '.');
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  const reduxMessages = useSelector(
    (state: RootState) => state.messages.inboxes[deserializedId]
  );

  const [messages, setMessages] = useState<ShinkaiMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const otherPersonIdentity = getOtherPersonIdentity(
    deserializedId,
    setupDetailsState.shinkai_identity
  );

  useEffect(() => {
    console.log('deserializedId:', deserializedId);
    getLastMessagesFromInbox(
      deserializedId,
      10,
      lastKey,
      setupDetailsState
    ).then((messages) => {
      console.log('receiveLastMessagesFromInbox Response:', messages);
      dispatch({
        type: RECEIVE_LAST_MESSAGES_FROM_INBOX,
        payload: { inboxId: deserializedId, messages: messages },
      });
    });
  }, [id, dispatch, setupDetailsState, deserializedId, lastKey]);

  useEffect(() => {
    if (reduxMessages && reduxMessages.length > 0) {
      console.log('Redux Messages:', reduxMessages);
      const lastMessage = reduxMessages[reduxMessages.length - 1];
      console.log('Last Message:', lastMessage);
      const timeKey = lastMessage.external_metadata.scheduled_time;
      const hashKey = calculateMessageHash(lastMessage);
      const lastMessageKey = `${timeKey}:${hashKey}`;
      setLastKey(lastMessageKey);
      setMessages(reduxMessages);

      if (reduxMessages.length - prevMessagesLength < 10) {
        setHasMoreMessages(false);
      }
      setPrevMessagesLength(reduxMessages.length);
    }
  }, [reduxMessages, prevMessagesLength]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const sendMessage = async () => {
    console.log('Sending message: ', inputMessage);
    if (inputMessage.trim() === '') return;

    // Local Identity
    const { shinkai_identity, profile, registration_name } = setupDetailsState;
    // let sender = shinkai_identity;
    const sender = `${shinkai_identity}/${profile}/device/${registration_name}`;

    console.log('Sender:', sender);

    const receiver = extractReceiverShinkaiName(deserializedId, sender);
    console.log('Receiver:', receiver);

    let inboxId, message;
    if (selectedFile) {
      // Call sendTextMessageWithFilesForInbox if selectedFile is not null
      ({ inboxId, message } = await sendTextMessageWithFilesForInbox(
        shinkai_identity,
        profile,
        receiver,
        inputMessage,
        deserializedId,
        selectedFile,
        setupDetailsState
      ));
    } else {
      ({ inboxId, message } = await sendTextMessageWithInbox(
        shinkai_identity,
        profile,
        receiver,
        inputMessage,
        deserializedId,
        setupDetailsState
      ));
    }
    dispatch(addMessageToInbox(inboxId, message));
    setInputMessage('');
    setSelectedFile(null);
  };
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

      <IonContentCustom>
        <div className="bg-white dark:bg-slate-900">
          {hasMoreMessages && (
            <IonButton
              onClick={async () => {
                const messages = await getLastMessagesFromInbox(
                  deserializedId,
                  10,
                  lastKey,
                  setupDetailsState
                );
                dispatch(
                  receiveLoadMoreMessagesFromInbox(deserializedId, messages)
                );
              }}
            >
              Load More
            </IonButton>
          )}
          <IonList class="ion-list-chat flex flex-col gap-10 p-0 md:rounded-[1.25rem] bg-transparent">
            {messages &&
              messages.slice().map((message, index) => {
                const { shinkai_identity, profile, registration_name } =
                  setupDetailsState;

                const localIdentity = `${profile}/device/${registration_name}`;
                // console.log("Message:", message);
                let isLocalMessage = false;
                if (message.body && 'unencrypted' in message.body) {
                  isLocalMessage =
                    message.body.unencrypted.internal_metadata
                      .sender_subidentity === localIdentity;
                }

                return (
                  <IonItem
                    className={cn(
                      'ion-item-chat relative',
                      isLocalMessage && 'isLocalMessage'
                    )}
                    key={index}
                    lines="none"
                  >
                    <div className="px-2 py-4 flex gap-4 pb-10 w-full">
                      <Avatar
                        className="shrink-0 mr-4"
                        url={
                          isLocalMessage
                            ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
                            : 'https://ui-avatars.com/api/?name=O&background=363636&color=fff'
                        }
                      />

                      <p>
                        {message.body && 'unencrypted' in message.body
                          ? 'unencrypted' in
                            message.body.unencrypted.message_data
                            ? message.body.unencrypted.message_data.unencrypted
                                .message_raw_content
                            : message.body.unencrypted.message_data.encrypted
                                .content
                          : message.body?.encrypted.content}
                      </p>
                      {message?.external_metadata?.scheduled_time && (
                        <span className="absolute bottom-[5px] right-5 text-muted text-sm">
                          {parseDate(
                            message.external_metadata.scheduled_time
                          ).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </IonItem>
                );
              })}
          </IonList>
          <div ref={bottomChatRef} />
        </div>
      </IonContentCustom>
      <IonFooterCustom>
        <div className={'w-full py-2 md:py-3 md:pl-4'}>
          <div className="m-2 flex items-end h-full border border-slate-300 pr-2 rounded-xl shadow">
            {selectedFile && (
              <img
                alt="Selected"
                className="h-20 w-auto"
                src={URL.createObjectURL(selectedFile)}
              />
            )}
            <IonTextarea
              autoGrow
              class="ion-textarea-chat"
              className="m-0 w-full bg-transparent p-0 pl-2 pr-12"
              onIonInput={(e) => setInputMessage(e.detail.value as string)}
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
              <IonIcon icon={send} size="" />
            </button>
          </div>
        </div>
      </IonFooterCustom>
    </IonPage>
  );
};

export default Chat;
