import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { cn } from '../../helpers/cn-utils';
import NavBar from '../nav/nav';

export const WithNav = (props: PropsWithChildren) => {
  const location = useLocation();
  const isInboxPage = location.pathname.includes('/inboxes/');
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col space-y-8',
        isInboxPage && 'space-y-4',
      )}
    >
      <NavBar />
      <div className="grow overflow-auto">{props.children}</div>
    </div>
  );
};
