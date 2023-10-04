import './inboxes.css';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
import { getAllInboxes } from '../../store/inbox/inbox-actions';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export const Inboxes = () => {
  const dispatch = useTypedDispatch();
  const history = useHistory();
  const inboxes = useSelector((state: RootState) => state.inbox.all.data);
  const navigateToInbox = (inboxId: string) => {
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  };

  useEffect(() => {
    dispatch(getAllInboxes());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      <ScrollArea>
        {inboxes?.map((inbox) => (
          <div key={inbox.id}>
            <div
              className="text-ellipsis overflow-hidden whitespace-nowrap"
              onClick={() => navigateToInbox(inbox.id)}
            >
              {inbox.id}
            </div>
            <Separator className="my-2" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
