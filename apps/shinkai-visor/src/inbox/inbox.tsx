import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { Avatar, List } from 'antd';
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
  const setup = useSelector((state: RootState) => {
    return state.node;
  });
  const messages = useSelector((state: RootState) => {
    return state.inbox.messages[decodeURIComponent(inboxId)]?.data;
  });

  const buildMessagesUI = () => {
    return messages?.map((message, index) => {
      return <span key={index}>{getMessageContent(message)}</span>;
    });
  };

  const getAvatar = (message: ShinkaiMessage) => {
    return isLocalMessage(
      message,
      setup.data?.nodeData?.profile || '',
      setup.data?.userData.registrationName || ''
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
      : 'https://ui-avatars.com/api/?name=O&background=363636&color=fff';
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
      <List<ShinkaiMessage>
        bordered
        className="h-full"
        dataSource={messages}
        itemLayout="horizontal"
        renderItem={(message) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={getAvatar(message)} />}
              description={getMessageContent(message)}
            />
          </List.Item>
        )}
      />
      <InboxInput inboxId={decodeURIComponent(inboxId)}></InboxInput>
    </div>
  );
};
