import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Button } from '@shinkai_network/shinkai-ui';
import { ScrollArea } from '@shinkai_network/shinkai-ui';
import { Plus } from 'lucide-react';
import { Fragment } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';

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
      {!agents?.length ? (
        <div className="flex h-full flex-col justify-center">
          <EmptyAgents data-testid="empty-agents" />
        </div>
      ) : (
        <>
          <ScrollArea className="flex h-full flex-col justify-between [&>div>div]:!block">
            <div className="space-y-3">
              {agents?.map((agent) => (
                <AgentCard key={agent.id} name={agent.id} />
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

function AgentCard({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between gap-3 truncate rounded-lg py-3.5 pr-2 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400">
      <span
        className="w-full truncate text-start"
        data-testid={`${name}-agent-button`}
      >
        {name}
      </span>
    </div>
  );
}
