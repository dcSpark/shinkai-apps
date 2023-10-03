import './inboxes.css';

import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
import { getAllInboxes } from '../../store/inbox/inbox-actions';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export const Inboxes = () => {
  const dispatch = useTypedDispatch();
  const history = useHistory();
  const inboxes = useSelector((state: RootState) => state.inbox.all.data);
  const inboxesStatus = useSelector(
    (state: RootState) => state.inbox.all?.status,
  );
  const navigateToCreateInbox = () => {
    history.push('/inboxes/create');
  };
  const navigateToCreateJob = () => {
    history.replace('/jobs/create');
  };
  const navigateToInbox = (inboxId: string) => {
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  };

  const isLoading = () => inboxesStatus === 'loading';

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
      <div className="flex flex-row space-x-3 justify-between">
        <Button className="grow" onClick={() => navigateToCreateInbox()}>
          <FormattedMessage id="create-inbox" />
        </Button>

        <Button className="grow" onClick={() => navigateToCreateJob()}>
          <FormattedMessage id="create-job" />
        </Button>
      </div>
    </div>
  );
};
