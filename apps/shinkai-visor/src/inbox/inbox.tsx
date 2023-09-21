import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { Avatar, List } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { InboxInput } from '../components/inbox-input/inbox-input';
import { RootState } from '../store';
import {
  getLastsMessagesForInbox,
  sendMessage,
} from '../store/inbox/inbox-actions';

export const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const dispatch = useDispatch();
  const [count, setCount] = useState(0);
  const setup = useSelector((state: RootState) => {
    return state.node;
  });
  const messages = useSelector((state: RootState) => {
    return state.inbox.messages[decodeURIComponent(inboxId)]?.data;
  });
  const sendMessageStatus = useSelector(
    (state: RootState) =>
      state.inbox?.sendMessage[decodeURIComponent(inboxId)]?.status
  );
  const isSendingMessage = useSelector(
    (state: RootState) =>
      state.inbox?.sendMessage[decodeURIComponent(inboxId)]?.status ===
      'loading'
  );

  const getAvatar = (message: ShinkaiMessage) => {
    return isLocalMessage(
      message,
      setup.data?.nodeData?.profile || '',
      setup.data?.userData.registrationName || ''
    )
      ? 'https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff'
      : 'https://ui-avatars.com/api/?name=O&background=363636&color=fff';
  };

  const submitSendMessage = (value: string) => {
    dispatch(
      sendMessage({ inboxId: decodeURIComponent(inboxId), message: value })
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setCount((old) => old + 1);
      dispatch(
        getLastsMessagesForInbox({
          inboxId: decodeURIComponent(inboxId),
        })
      );
    }, 1000);
  }, [count, inboxId, dispatch]);

  useEffect(() => {
    switch (sendMessageStatus) {
      case 'succeeded':
        break;
    }
  }, [sendMessageStatus]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      <List<ShinkaiMessage>
        bordered
        className="h-full overflow-x-hidden overflow-y-auto"
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
      <InboxInput
        disabled={isSendingMessage}
        loading={isSendingMessage}
        onSubmit={(value) => submitSendMessage(value)}
      ></InboxInput>
    </div>
  );
};
