import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Button } from '@shinkai_network/shinkai-ui';
import { ScrollArea } from '@shinkai_network/shinkai-ui';
import { Plus } from 'lucide-react';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { Header } from '../header/header';

export const Agents = () => {
  const auth = useAuth((state) => state.auth);
  const history = useHistory();
  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const onAddAgentClick = () => {
    history.push('/agents/add');
  };
  return (
    <div className="flex h-full flex-col space-y-3">
      <Header title={<FormattedMessage id="agent.other" />} />
      {!agents?.length ? (
        <div className="flex h-full flex-col justify-center">
          <EmptyAgents data-testid="empty-agents" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex h-full flex-col justify-between [&>div>div]:!block">
            <div className="space-y-3">
              {agents?.map((agent) => (
                <Fragment key={agent.id}>
                  <Button className="w-full" data-testid={`${agent.id}-agent-button`} variant="ghost">
                    <span className="w-full truncate text-start">
                      {agent.id}
                    </span>
                  </Button>
                </Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="fixed bottom-4 right-4">
            <Button
              className="h-[60px] w-[60px]"
              data-testid="add-agent-button"
              onClick={onAddAgentClick}
              size="icon"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
