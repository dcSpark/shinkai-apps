import { Button, Menu } from 'antd';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../../service-worker/store';
import { getAllInboxes } from '../../service-worker/store/inbox/inbox-actions';

export const Inboxes = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const inboxes = useSelector((state: RootState) => state.inbox.all);
  const createInbox = () => {
    history.push('/inboxes/create');
  };
  const [inboxItems, setInboxItems] = useState<MenuItemType[]>([]);

  const navigateToInbox = (inboxId: string) => {
    console.log('navigate to inbox', inboxId);
    const encodedInboxId = inboxId.replace('.', '-');
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  }

  useEffect(() => {
    dispatch(getAllInboxes());
  }, [dispatch]);
  useEffect(() => {
    const items = inboxes?.data?.map<MenuItemType>((inbox) => ({
      key: inbox.id, label: inbox.id,
    })) || [];
    setInboxItems(items);
  }, [inboxes]);

  return (
    <div>
      <h1>Inboxes</h1>
        <Menu
          items={inboxItems}
          onClick={(e) => navigateToInbox(e.key)}
        />
      <Button onClick={() => createInbox()}>Create Inbox</Button>
    </div>
  );
};
