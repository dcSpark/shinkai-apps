import './inboxes.css';

import { Button, List } from 'antd';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState, useTypedDispatch } from '../../store';
import { Inbox } from '../../store/agents/agents-types';
import { getAllInboxes } from '../../store/inbox/inbox-actions';

export const Inboxes = () => {
  const dispatch = useTypedDispatch();
  const history = useHistory();
  const inboxes = useSelector((state: RootState) => state.inbox.all.data);
  const inboxesStatus = useSelector(
    (state: RootState) => state.inbox.all?.status
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
      <div className="flex flex-row space-x-3 justify-between">
        <Button
          className="grow"
          onClick={() => navigateToCreateInbox()}
          type="primary"
        >
          <FormattedMessage id="create-inbox" />
        </Button>

        <Button
          className="grow"
          onClick={() => navigateToCreateJob()}
          type="primary"
        >
          <FormattedMessage id="create-job" />
        </Button>
      </div>
    </div>
  );
};
