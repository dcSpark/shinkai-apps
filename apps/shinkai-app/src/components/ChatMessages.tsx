import {
  IonButton,
  IonItem,
  IonList,
  IonSkeletonText,
  IonThumbnail,
} from '@ionic/react';
import {
  getLastMessagesFromInbox,
  getLastUnreadMessagesFromInbox,
} from '@shinkai_network/shinkai-message-ts/api/methods';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import { calculateMessageHash } from '@shinkai_network/shinkai-message-ts/utils/shinkai_message_handler';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Avatar from '../components/ui/Avatar';
import { RootState } from '../store';
import { receiveLastMessagesFromInbox } from '../store/actions';
import { cn } from '../theme/lib/utils';
import { IonContentCustom } from './ui/Layout';

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
  const [messages, setMessages] = useState<Record<string, ShinkaiMessage[]>>(
    {}
  );
  const [isScrolling, setScrolling] = useState(true);

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

      setMessages(groupMessagesByDate(reduxMessages));

      if (reduxMessages.length - prevMessagesLength < 10) {
        setHasMoreMessages(false);
      }
      setPrevMessagesLength(reduxMessages.length);
    }
  }, [reduxMessages, prevMessagesLength]);

  React.useEffect(() => {
    const scrollToBottom = async () => {
      if (chatContainerRef.current) {
        const scrollElement = await chatContainerRef.current.getScrollElement();
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    };
    scrollToBottom();
  }, [isSuccess]);

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
    void loadScroll();
  }, [chatContainerRef]);

  return (
    <IonContentCustom ref={chatContainerRef}>
      <div className="bg-white dark:bg-slate-900">
        {!isLoading && hasMoreMessages && (
          <IonButton
            onClick={() =>
              getLastMessagesFromInbox(
                deserializedId,
                10,
                lastKey,
                setupDetailsState
                // true
              )
            }
          >
            Load More
          </IonButton>
        )}
        <IonList class="p-0 md:rounded-[1.25rem] bg-white dark:bg-slate-900 flex flex-col gap-4 md:gap-1 py-6">
          {isLoading &&
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
          {isSuccess &&
            Object.entries(messages)?.map(([date, messages]) => {
              return (
                <div key={date}>
                  <div
                    className={cn(
                      'relative flex shadow-lg z-10 bg-white border border-slate-300 w-[140px] m-auto  items-center justify-center rounded-xl transition-opacity',
                      'dark:bg-slate-900 dark:border-slate-700 dark:text-gray-400',
                      isScrolling && 'sticky top-5'
                    )}
                  >
                    <div className="px-2.5 py-2 text-sm font-semibold text-slate-700 dark:text-gray-400">
                      {date}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 md:gap-8 py-10">
                    {messages.map((message, idx) => {
                      const { shinkai_identity, profile, registration_name } =
                        setupDetailsState;

                      const localIdentity = `${profile}/device/${registration_name}`;
                      let isLocalMessage = false;
                      if (message.body && 'unencrypted' in message.body) {
                        isLocalMessage =
                          message.body.unencrypted.internal_metadata
                            .sender_subidentity === localIdentity ||
                          message.external_metadata?.sender ===
                            shinkai_identity;
                      }

                      return (
                        <IonItem
                          className={cn(
                            'ion-item-chat relative',
                            isLocalMessage && 'isLocalMessage'
                          )}
                          key={idx}
                          lines="none"
                        >
                          <div
                            className={cn(
                              'px-2 py-6 flex gap-2 md:gap-8 pb-14',
                              isLocalMessage && 'flex-row-reverse'
                            )}
                          >
                            <Avatar
                              className="shrink-0"
                              url={
                                isLocalMessage
                                  ? 'https://ui-avatars.com/api/?name=Me&background=0f172a&color=fff'
                                  : 'https://ui-avatars.com/api/?name=O&background=1C3A3A&color=fff'
                              }
                            />

                            <p>{extractContent(message.body)}</p>
                          </div>
                        </IonItem>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </IonList>
      </div>
    </IonContentCustom>
  );
};

export default ChatMessages;
