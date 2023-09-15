import { getMessageContent } from '@shinkai/shinkai-message-ts/utils';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from '../store';
import { getLastsMessagesForInbox } from '../store/inbox/inbox-actions';

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const dispatch = useDispatch();
  const messageCount = 10;
  const messages = useSelector(
    (state: RootState) => {
      console.log('messages selector', state.inbox.messages, decodeURIComponent(inboxId));
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
    <div className="flex flex-col space-y-2">
      <span>Inbox:{decodeURIComponent(inboxId)}</span>
      {buildMessagesUI()}
    </div>
  );
};
