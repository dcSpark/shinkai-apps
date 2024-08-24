import { useGetInboxes } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxes';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../store/auth/auth';

export const useGetCurrentInbox = () => {
  const auth = useAuth((state) => state.auth);
  const location = useLocation();

  const { inboxes } = useGetInboxes(
    { nodeAddress: auth?.node_address ?? '' },
    { staleTime: Infinity },
  );
  const currentInbox = useMemo(() => {
    const inboxId = location.pathname.split('/')?.[2];
    const decodedInboxId = decodeURIComponent(inboxId);
    return inboxes.find((inbox) => decodedInboxId === inbox.inbox_id);
  }, [inboxes, location.pathname]);

  return currentInbox;
};
