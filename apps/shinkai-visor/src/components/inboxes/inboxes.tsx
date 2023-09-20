import './inboxes.css';

import { Button, List, Menu } from 'antd';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../../store';
import { Inbox } from '../../store/agents/agents-types';
import { getAllInboxes } from '../../store/inbox/inbox-actions';

export const Inboxes = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const inboxes = useSelector((state: RootState) => state.inbox.all.data);
  const inboxesStatus = useSelector((state: RootState) => state.inbox.all?.status);
  const createInbox = () => {
    history.push('/inboxes/create');
  };
  const navigateToInbox = (inboxId: string) => {
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  }
  const isLoading = () => inboxesStatus === 'loading';
  useEffect(() => {
    dispatch(getAllInboxes());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between">
        <List<Inbox>
        bordered
        dataSource={inboxes || []}
        loading={isLoading()}
        renderItem={(inbox) => (
          <List.Item key={inbox.id} onClick={(e) => navigateToInbox(inbox.id)}>
            {/* TODO: Improve agent typification */}
            <div className="inbox-id-container">{inbox.id}</div>
          </List.Item>
        )}
      />
      <Button onClick={() => createInbox()} type="primary">Create Inbox</Button>
    </div>
  );
};
