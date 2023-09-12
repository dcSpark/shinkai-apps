import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getLastMessagesFromInbox,
  getLastUnreadMessagesFromInbox,
} from '@shinkai/shinkai-message-ts/api/methods';
import { ShinkaiMessage } from '@shinkai/shinkai-message-ts/models';
import {
  IonList,
  IonItem,
  IonButton,
  IonSkeletonText,
  IonThumbnail,
} from '@ionic/react';
import Avatar from '../components/ui/Avatar';
import { cn } from '../theme/lib/utils';
import { IonContentCustom } from './ui/Layout';
import { calculateMessageHash } from '@shinkai/shinkai-message-ts/utils/shinkai_message_handler';
import { RootState } from '../store';
import { receiveLastMessagesFromInbox } from '../store/actions';

const extractContent = (messageBody: any) => {
  // TODO: extend it so it can be re-used by JobChat or normal Chat
  if (messageBody && 'unencrypted' in messageBody) {
    if ('unencrypted' in messageBody.unencrypted.message_data) {
      return JSON.parse(
        messageBody.unencrypted.message_data.unencrypted.message_raw_content
      ).content;
    } else {
      return JSON.parse(messageBody.unencrypted.message_data.encrypted.content)
        .content;
    }
  } else if (messageBody?.encrypted) {
    return JSON.parse(messageBody.encrypted.content).content;
  }
  return '';
};
interface ChatMessagesProps {
  deserializedId: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ deserializedId }) => {
  console.log('Loading ChatMessages.tsx');
  const dispatch = useDispatch();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetails
  );
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'success' | 'rejected'
  >('idle');
  const isLoading = status === 'pending';
  const isSuccess = status === 'success';
  const isRejected = status === 'rejected';

  const reduxMessages = useSelector(
    (state: RootState) => state.messages.inboxes[deserializedId]
  );

  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [mostRecentKey, setMostRecentKey] = useState<string | undefined>(
    undefined
  );
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messages, setMessages] = useState<ShinkaiMessage[]>([]);

  const chatContainerRef = React.createRef<HTMLIonContentElement>();

  useEffect(() => {
    console.log('deserializedId:', deserializedId);
    setStatus('pending');
    getLastMessagesFromInbox(deserializedId, 10, lastKey, setupDetailsState)
      .then((messages) => {
        setStatus('success');
        dispatch(receiveLastMessagesFromInbox(deserializedId, messages));
      })
      .catch((error) => {
        setStatus('rejected');
        console.log('Error:', error);
      });
  }, [dispatch, setupDetailsState, deserializedId, lastKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      getLastUnreadMessagesFromInbox(
        deserializedId,
        10,
        mostRecentKey,
        setupDetailsState
      ).then((messages) => {
        dispatch(receiveLastMessagesFromInbox(deserializedId, messages));
      });
    }, 5000); // 2000 milliseconds = 2 seconds
    return () => clearInterval(interval);
  }, [dispatch, deserializedId, mostRecentKey, setupDetailsState]);

  useEffect(() => {
    if (reduxMessages && reduxMessages.length > 0) {
      // console.log("Redux Messages:", reduxMessages);
      const lastMessage = reduxMessages[reduxMessages.length - 1];
      console.log('Last Message:', lastMessage);
      const timeKey = lastMessage.external_metadata.scheduled_time;
      const hashKey = calculateMessageHash(lastMessage);
      const lastMessageKey = `${timeKey}:::${hashKey}`;
      setLastKey(lastMessageKey);

      const mostRecentMessage = reduxMessages[0];
      const mostRecentTimeKey =
        mostRecentMessage.external_metadata.scheduled_time;
      const mostRecentHashKey = calculateMessageHash(mostRecentMessage);
      const mostRecentMessageKey = `${mostRecentTimeKey}:::${mostRecentHashKey}`;
      setMostRecentKey(mostRecentMessageKey);

      setMessages(reduxMessages);

      if (reduxMessages.length - prevMessagesLength < 10) {
        setHasMoreMessages(false);
      }
      setPrevMessagesLength(reduxMessages.length);
    }
  }, [reduxMessages, prevMessagesLength]);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      void chatContainerRef.current.scrollToBottom(100);
    }
  }, [isSuccess]);

  return (
    <IonContentCustom ref={chatContainerRef}>
      <div className="bg-white dark:bg-slate-800">
        {!isLoading && hasMoreMessages && (
          <IonButton
            onClick={() =>
              dispatch(
                getLastMessagesFromInbox(
                  deserializedId,
                  10,
                  lastKey,
                  setupDetailsState
                  // true
                )
              )
            }
          >
            Load More
          </IonButton>
        )}
        <IonList class="flex flex-col gap-10 p-0 md:rounded-[1.25rem] bg-slate-900">
          {isLoading &&
            Array.from({ length: 6 }).map((item, idx) => (
              <IonItem
                key={idx}
                lines="none"
                className="ion-item-chat relative w-full shadow"
              >
                <div className="px-2 py-4 flex gap-4 pb-10 w-full">
                  <IonThumbnail className={'rounded-[1.5rem]'} slot="start">
                    <IonSkeletonText
                      className={'rounded-[8px]'}
                      animated={true}
                    ></IonSkeletonText>
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
          {isSuccess &&
            messages?.map((message, index) => {
              const { shinkai_identity, profile, registration_name } =
                setupDetailsState;

              const localIdentity = `${profile}/device/${registration_name}`;
              let isLocalMessage = false;
              if (message.body && 'unencrypted' in message.body) {
                isLocalMessage =
                  message.body.unencrypted.internal_metadata
                    .sender_subidentity === localIdentity ||
                  message.external_metadata?.sender === shinkai_identity;
              }

              return (
                <IonItem
                  key={index}
                  lines="none"
                  className={cn(
                    'ion-item-chat relative',
                    isLocalMessage && 'isLocalMessage'
                  )}
                >
                  <div
                    className={cn(
                      'px-2 py-6 flex gap-8 pb-14',
                      isLocalMessage && 'flex-row-reverse'
                    )}
                  >
                    <Avatar
                      className="shrink-0"
                      url={
                        isLocalMessage
                          ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
                          : 'https://ui-avatars.com/api/?name=O&background=363636&color=fff'
                      }
                    />

                    <p>{extractContent(message.body)}</p>
                    {message?.external_metadata?.scheduled_time && (
                      <span className="absolute bottom-[16px] right-5 text-muted text-sm">
                        {new Date(
                          message.external_metadata.scheduled_time
                        ).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </IonItem>
              );
            })}
        </IonList>
      </div>
    </IonContentCustom>
  );
};

export default ChatMessages;
