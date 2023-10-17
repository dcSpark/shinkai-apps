import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { Fragment } from 'react';

import { useAuth } from '../../store/auth/auth';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

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
  return (
    <div className="[&>div>div]:!block h-full flex flex-col space-y-3 justify-between">
      <ScrollArea>
        {agents?.map((agent) => (
          <Fragment key={agent.id}>
            <Button className="w-full" variant="tertiary">
              <span className="w-full truncate text-start">
                {agent.id}
              </span>
            </Button>
          </Fragment>
        ))}
      </ScrollArea>
    </div>
  );
};
