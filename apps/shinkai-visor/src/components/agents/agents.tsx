import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Bot } from 'lucide-react';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';

import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export const Agents = () => {
  const auth = useAuth((state) => state.auth);
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
  return !agents?.length ? (
    <div className="h-full flex flex-col justify-center">
      <EmptyAgents></EmptyAgents>
    </div>
  ) : (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-row space-x-1 items-center">
        <Bot className="h-4 w-4" />
        <h1 className="font-semibold">
          <FormattedMessage id="agent.other"></FormattedMessage>
        </h1>
      </div>
      <ScrollArea className="[&>div>div]:!block h-full flex flex-col space-y-3 justify-between">
        {agents?.map((agent) => (
          <Fragment key={agent.id}>
            <Button className="w-full" variant="tertiary">
              <span className="w-full truncate text-start">{agent.id}</span>
            </Button>
          </Fragment>
        ))}
      </ScrollArea>
    </div>
  );
};
