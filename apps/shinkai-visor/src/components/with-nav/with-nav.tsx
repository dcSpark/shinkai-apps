import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import { useToast } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { PropsWithChildren, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import NavBar from '../nav/nav';

export const WithNav = (props: PropsWithChildren) => {
  const location = useLocation();
  const auth = useAuth((state) => state.auth);
  const isInboxPage = location.pathname.includes('/inboxes/');
  const { toast } = useToast();

  const { nodeInfo, isSuccess, isFetching, ...data } = useGetHealth(
    { node_address: auth?.node_address ?? '' },
    { refetchInterval: 10000, enabled: !!auth },
  );

  useEffect(() => {
    if (isSuccess && nodeInfo?.status !== 'ok') {
      toast({
        title: 'Node Unavailable',
        description:
          'Visor is having trouble connecting to your Shinkai Node. Your node may be offline, or your internet connection may be down.',
        variant: 'destructive',
      });
    }
  }, [isSuccess, nodeInfo?.status, isFetching, toast]);

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col space-y-3.5',
        isInboxPage && 'space-y-4',
      )}
    >
      <NavBar />
      <div className="grow overflow-auto">{props.children}</div>
    </div>
  );
};
