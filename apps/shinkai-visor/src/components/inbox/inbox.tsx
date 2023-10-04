import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
import {
  getLastsMessagesForInbox,
  sendMessage,
} from '../../store/inbox/inbox-actions';
import { InboxInput } from '../inbox-input/inbox-input';
import { ScrollArea } from '../ui/scroll-area';

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const dispatch = useTypedDispatch();
  const [polling, setPolling] = useState(0);
  const pollingMs = 2000;
  const setup = useSelector((state: RootState) => {
    return state.node;
  });
  const messages = useSelector((state: RootState) => {
    return state.inbox.messages[decodeURIComponent(inboxId)]?.data;
  });
  const isSendingMessage = useSelector(
    (state: RootState) =>
      state.inbox?.sendMessage[decodeURIComponent(inboxId)]?.status ===
      'loading',
  );
  const getAvatar = (message: ShinkaiMessage) => {
    return isLocalMessage(
      message,
      setup.data?.nodeData?.profile || '',
      setup.data?.userData.registrationName || '',
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
      : 'https://ui-avatars.com/api/?name=O&background=363636&color=fff';
  };
  const submitSendMessage = (value: string) => {
    dispatch(
      sendMessage({ inboxId: decodeURIComponent(inboxId), message: value }),
    );
  };
  useEffect(() => {
    setTimeout(() => {
      setPolling((old) => old + 1);
      dispatch(
        getLastsMessagesForInbox({
          inboxId: decodeURIComponent(inboxId),
        }),
      );
    }, pollingMs);
  }, [polling, inboxId, dispatch]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      <ScrollArea className="[&>div>div]:!block">
        <div className="flex flex-col space-y-2">
          {messages?.map((message) => (
            <div
              className={`flex w-max max-w-[75%] flex-col gap-2 rounded-b-lg px-3 py-2 text-sm bg-muted ${
                isLocalMessage(
                  message,
                  setup.data?.nodeData?.shinkaiIdentity || '',
                  setup.data?.nodeData.profile || '',
                )
                  ? 'ml-auto bg-primary text-primary-foreground rounded-l-lg'
                  : 'rounded-r-lg'
              }`}
              key={message.external_metadata?.scheduled_time}
            >
              {getMessageContent(message)}
            </div>
          ))}
        </div>
      </ScrollArea>
      <InboxInput
        disabled={isSendingMessage}
        loading={isSendingMessage}
        onSubmit={(value) => submitSendMessage(value)}
      ></InboxInput>
    </div>
  );
};
