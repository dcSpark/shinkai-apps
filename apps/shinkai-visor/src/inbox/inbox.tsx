import { getMessageContent } from '@shinkai_network/shinkai-message-ts/utils';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { InboxInput } from '../components/inbox-input/inbox-input';
import { RootState } from '../store';
import { getLastsMessagesForInbox } from '../store/inbox/inbox-actions';

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const dispatch = useDispatch();
  const messageCount = 10;
  const messages = useSelector(
    (state: RootState) => {
      return state.inbox.messages[decodeURIComponent(inboxId)]?.data;
    }
  );

  const buildMessagesUI = () => {
    return messages?.map((message, index) => {
      return <span key={index}>{getMessageContent(message)}</span>;
    });
  };

  useEffect(() => {
    dispatch(
      getLastsMessagesForInbox({
        inboxId: decodeURIComponent(inboxId),
        count: messageCount,
        lastKey: undefined,
      })
    );
  }, [inboxId, dispatch]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between">
      <div className="flex flex-col space-y-1">
      {buildMessagesUI()}
      </div>
      <InboxInput inboxId={decodeURIComponent(inboxId)}></InboxInput>
    </div>
  );
};
