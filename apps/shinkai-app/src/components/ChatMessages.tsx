import { IonItem, IonList, IonSkeletonText, IonThumbnail } from '@ionic/react';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils/shinkai_message_handler';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import MarkdownPreview from '@uiw/react-markdown-preview';
import React, { Fragment, useState } from 'react';

import Avatar from '../components/ui/Avatar';
import { useAuth } from '../store/auth';
import { cn } from '../theme/lib/utils';
import { IonContentCustom } from './ui/Layout';

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
  const auth = useAuth((state) => state.auth);

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
    const scrollToBottom = async () => {
      if (chatContainerRef.current) {
        const scrollElement = await chatContainerRef.current.getScrollElement();
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    };
    scrollToBottom();
  }, [isChatConversationSuccess]);

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

  const getAvatar = (message: ShinkaiMessage) => {
    return isLocalMessage(
      message,
      auth?.shinkai_identity || '',
      auth?.profile || ''
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
      : 'https://ui-avatars.com/api/?name=S&background=363636&color=fff';
  };

  return (
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
                          {messages.map((message) => {
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
                                key={message?.external_metadata?.scheduled_time}
                                lines="none"
                              >
                                <div
                                  className={cn(
                                    'px-2 py-6 flex gap-2 md:gap-8 pb-14',
                                    isLocal && 'flex-row-reverse'
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
  );
};

export default ChatMessages;
