import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../store/auth';

export const useGetCurrentInbox = () => {
  const auth = useAuth((state) => state.auth);
  const location = useLocation();

  const { inboxes } = useGetInboxes({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: auth?.profile ?? '',
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: auth?.shinkai_identity ?? '',
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const currentInbox = useMemo(() => {
    const inboxId = location.pathname.split('/')?.[2];
    const decodedInboxId = decodeURIComponent(inboxId);
    return inboxes.find((inbox) => decodedInboxId === inbox.inbox_id);
  }, [inboxes, location.pathname]);

  return currentInbox;
};
