import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import NavBar from '../nav/nav';

export const WithNav = () => {
  const auth = useAuth((state) => state.auth);
  const location = useLocation();

  const { nodeInfo, isSuccess, isFetching } = useGetHealth(
    { node_address: auth?.node_address ?? '' },
    { refetchInterval: 10000, enabled: !!auth },
  );
  const isInboxPage =
    location.pathname.includes('/inboxes/job_inbox') ||
    location.pathname.includes('/inboxes/inbox');

  useEffect(() => {
    if (isSuccess && nodeInfo?.status !== 'ok') {
      toast.error('Node Unavailable', {
        description:
          'Visor is having trouble connecting to your Shinkai Node. Your node may be offline, or your internet connection may be down.',
        important: true,
        id: 'node-unavailable',
        duration: 20000,
      });
    }
    if (isSuccess && nodeInfo?.status === 'ok') {
      toast.dismiss('node-unavailable');
    }
  }, [isSuccess, nodeInfo?.status, isFetching]);

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col space-y-6',
        isInboxPage && 'space-y-0',
      )}
    >
      <NavBar />
      <div className="grow overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
