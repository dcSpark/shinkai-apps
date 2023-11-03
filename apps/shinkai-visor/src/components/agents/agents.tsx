import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Bot, Plus } from 'lucide-react';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export const Agents = () => {
  const auth = useAuth((state) => state.auth);
  const history = useHistory();
  const { agents } = useAgents({
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
    <div className="h-full flex flex-col space-y-3">
      <Header
        icon={<Bot />}
        title={<FormattedMessage id="agent.other"></FormattedMessage>}
      />
      {!agents?.length ? (
        <div className="h-full flex flex-col justify-center">
          <EmptyAgents></EmptyAgents>
        </div>
      ) : (
        <>
          <ScrollArea className="[&>div>div]:!block h-full flex flex-col space-y-3 justify-between">
            {agents?.map((agent) => (
              <Fragment key={agent.id}>
                <Button className="w-full" variant="tertiary">
                  <span className="w-full truncate text-start">{agent.id}</span>
                </Button>
              </Fragment>
            ))}
          </ScrollArea>
          <div className="fixed right-4 bottom-4">
            <Button onClick={() => onAddAgentClick()} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
