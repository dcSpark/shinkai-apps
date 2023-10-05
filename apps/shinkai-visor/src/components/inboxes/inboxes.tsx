import './inboxes.css';

import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export const Inboxes = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const sender = auth?.shinkai_identity ?? '';
  const { inboxIds } = useGetInboxes({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}/device/${auth?.registration_name}`,
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: sender,
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const navigateToInbox = (inboxId: string) => {
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  };

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      <ScrollArea>
        {inboxIds?.map((inboxId) => (
          <div key={inboxId}>
            <div
              className="text-ellipsis overflow-hidden whitespace-nowrap"
              onClick={() => navigateToInbox(inboxId)}
            >
              {inboxId}
            </div>
            <Separator className="my-2" />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
