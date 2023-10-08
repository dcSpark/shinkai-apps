import { useAgents } from "@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents";

import { useAuth } from '../../store/auth/auth';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export const Agents = () => {
  const auth = useAuth((state) => state.auth);
  const { agents } = useAgents({
    sender: auth?.shinkai_identity ?? "",
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? "",
    my_device_encryption_sk: auth?.profile_encryption_sk ?? "",
    my_device_identity_sk: auth?.profile_identity_sk ?? "",
    node_encryption_pk: auth?.node_encryption_pk ?? "",
    profile_encryption_sk: auth?.profile_encryption_sk ?? "",
    profile_identity_sk: auth?.profile_identity_sk ?? "",
  });
  return (
    <div className="h-full flex flex-col space-y-3 justify-between">
      <ScrollArea>
        {agents?.map((agent) => (
          <div key={agent.id}>
            <div
              className="text-ellipsis overflow-hidden whitespace-nowrap"
            >
              {agent.id}
            </div>
            <Separator className="my-2" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
