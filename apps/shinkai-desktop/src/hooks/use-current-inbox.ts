import { useGetInboxesWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxesWithPagination';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../store/auth';

export const useGetCurrentInbox = (inboxId?: string) => {
  const auth = useAuth((state) => state.auth);
  const location = useLocation();

  const { data: inboxesPagination } = useGetInboxesWithPagination({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });
  const currentInbox = useMemo(() => {
    const currentInboxId = inboxId ?? location.pathname.split('/')?.[2];

    const decodedInboxId = decodeURIComponent(currentInboxId);
    return inboxesPagination?.pages
      .flatMap((page) => page.inboxes)
      .find((inbox) => decodedInboxId === inbox.inbox_id);
  }, [inboxId, inboxesPagination, location.pathname]);

  return currentInbox;
};
