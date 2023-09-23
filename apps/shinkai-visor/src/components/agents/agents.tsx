import { SerializedAgent } from '@shinkai_network/shinkai-message-ts/models';
import { Button, List } from 'antd';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import { RootState, useTypedDispatch } from '../../store';
import { getAgents } from '../../store/agents/agents-actions';

export const Agents = () => {
  const dispatch = useTypedDispatch();
  const history = useHistory();
  const agents = useSelector((state: RootState) => state.agents?.agents?.data);
  const isLoading = useSelector(
    (state: RootState) => state.agents?.agents?.status === 'loading'
  );
  const navigateToAddAgent = () => {
    history.push('/agents/add');
  };
  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);

  return (
    <div className="h-full flex flex-col space-y-3 justify-between">
      <List<SerializedAgent>
        bordered
        dataSource={agents || []}
        loading={isLoading}
        renderItem={(agent) => (
          <List.Item key={agent.id}>
            {/* TODO: Improve agent typification */}
            {(agent.full_identity_name as any)?.subidentity_name}
          </List.Item>
        )}
      />
      <Button onClick={() => navigateToAddAgent()} type="primary">
        <FormattedMessage id="add-agent" />
      </Button>
    </div>
  );
};
