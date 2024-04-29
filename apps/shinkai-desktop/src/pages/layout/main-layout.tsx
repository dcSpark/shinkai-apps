import { ExitIcon, GearIcon } from '@radix-ui/react-icons';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ChatBubbleIcon,
  FilesIcon,
  JobBubbleIcon,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  BotIcon,
  CodesandboxIcon,
  Compass,
  LibraryBig,
  SearchCode,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ONBOARDING_PATH } from '../../routes/name';
import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';
import { openShinkaiNodeManagerWindow } from '../../windows/utils';

type NavigationLink = {
  title: string;
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
};
export function MainNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuth((state) => state.setLogout);
  const auth = useAuth((state) => state.auth);
  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);

  const confirmDisconnect = () => {
    setIsConfirmLogoutDialogOpened(true);
  };

  const handleDisconnect = () => {
    logout();
    navigate(ONBOARDING_PATH);
  };

  const navigationLinks = [
    {
      title: 'Conversations',
      href: '/inboxes',
      icon: <JobBubbleIcon className="h-6 w-6" />,
    },
    {
      title: 'Create AI Chat',
      href: '/create-job',
      icon: <JobBubbleIcon className="h-6 w-6" />,
    },
    auth?.shinkai_identity.includes('localhost') && {
      title: 'Create DM Chat',
      href: '/create-chat',
      icon: <ChatBubbleIcon className="h-6 w-6" />,
    },
    {
      title: 'Add Agent',
      href: '/add-agent',
      icon: <BotIcon className="h-6 w-6" />,
    },
    {
      title: 'My AI Files Explorer',
      href: '/vector-fs',
      icon: <FilesIcon className="h-6 w-6" />,
    },
    {
      title: 'AI Files Content Search',
      href: '/vector-fs/search',
      icon: <SearchCode className="h-6 w-6" />,
    },
    {
      title: 'Browse Public Subscriptions',
      href: '/subscriptions/public',
      icon: <Compass className="h-6 w-6" />,
    },
    {
      title: 'My Subscriptions',
      href: '/subscriptions',
      icon: <LibraryBig className="h-6 w-6" />,
    },
    isLocalShinkaiNodeIsUse && {
      title: 'Shinkai Node Manager',
      href: '',
      icon: <CodesandboxIcon className="h-6 w-6" />,
      onClick: () => openShinkaiNodeManagerWindow(),
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <GearIcon className="h-6 w-6" />,
    },
    {
      title: 'Disconnect',
      href: '#',
      icon: <ExitIcon className="h-6 w-6" />,
      onClick: () => confirmDisconnect(),
    },
  ].filter(Boolean) as NavigationLink[];

  return (
    <aside className="fixed inset-0 z-30 flex w-[80px] shrink-0 flex-col gap-2 overflow-y-auto border-r bg-gradient-to-b from-gray-400 to-gray-500 px-2 py-6 shadow-2xl">
      {navigationLinks.map((item) => {
        return (
          <React.Fragment key={item.title}>
            {(item.title === 'My AI Files Explorer' ||
              item.title === 'Settings' ||
              item.title === 'Browse Public Subscriptions') && (
              <Separator className="w-full bg-gray-200" />
            )}
            <TooltipProvider delayDuration={0} key={item.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    className={cn(
                      'flex flex-col items-center justify-center rounded-lg px-4 py-3 text-white',
                      // 'lg:flex-row lg:justify-start lg:gap-2',
                      location.pathname === item.href
                        ? 'bg-gray-200 text-white shadow-lg'
                        : 'opacity-70 hover:bg-gray-200 hover:opacity-100',
                    )}
                    onClick={item.onClick}
                    rel={item.external ? 'noreferrer' : ''}
                    target={item.external ? '_blank' : ''}
                    to={item.href}
                  >
                    <span>{item.icon}</span>
                    {/*<span className="hidden text-center text-xs lg:block lg:truncate">*/}
                    {/*  {item.title}*/}
                    {/*</span>*/}
                  </Link>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent align="center" side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </React.Fragment>
        );
      })}

      <AlertDialog
        onOpenChange={setIsConfirmLogoutDialogOpened}
        open={isConfirmLogoutDialogOpened}
      >
        <AlertDialogContent className="w-[75%]">
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Shinkai</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col space-y-3 text-left text-white/70">
                <div className="flex flex-col space-y-1 ">
                  <span className="text-sm">
                    Are you sure you want to disconnect? This will permanently
                    delete your data
                  </span>
                </div>
                <div className="text-sm">
                  Before continuing, please
                  <Link
                    className="mx-1 inline-block cursor-pointer text-white underline"
                    onClick={() => {
                      setIsConfirmLogoutDialogOpened(false);
                    }}
                    to={'/export-connection'}
                  >
                    export your connection
                  </Link>
                  to restore your connection at any time.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-1">
            <AlertDialogCancel
              className="mt-0 flex-1"
              onClick={() => {
                setIsConfirmLogoutDialogOpened(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1" onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

const MainLayout = () => {
  const auth = useAuth((state) => state.auth);
  const { nodeInfo, isSuccess, isFetching } = useGetHealth(
    { node_address: auth?.node_address ?? '' },
    { refetchInterval: 10000, enabled: !!auth },
  );

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
    <div className="flex min-h-full flex-col bg-gray-500 text-white">
      <div className={cn('flex flex-1', !!auth && '')}>
        {!!auth && <MainNav />}
        <div className="flex-1 pl-[80px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default MainLayout;
