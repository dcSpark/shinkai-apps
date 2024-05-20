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
  Button,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { FilesIcon, InboxIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  BotIcon,
  CodesandboxIcon,
  Compass,
  LibraryBig,
  PlusIcon,
  SearchCode,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Link,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';

import { openShinkaiNodeManagerWindow } from '../../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';

type NavigationLink = {
  title: string;
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
};

const sidebarTransition: TargetAndTransition['transition'] = {
  duration: 0.3,
  type: 'spring',
  damping: 20,
  stiffness: 150,
  mass: 1,
};
const showAnimation = {
  hidden: {
    width: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
  show: {
    opacity: 1,
    width: 'auto',
    transition: {
      duration: 0.3,
    },
  },
};
const NavLink = ({
  href,
  external,
  onClick,
  icon,
  title,
}: {
  href: string;
  external?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
}) => {
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const isMatch = useMatch({
    path: href,
    end: false,
  });

  return (
    <Link
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-4 py-3 text-white transition-colors',
        isMatch
          ? 'bg-gray-500 text-white shadow-xl'
          : 'opacity-60 hover:bg-gray-500 hover:opacity-100',
      )}
      onClick={onClick}
      rel={external ? 'noreferrer' : ''}
      target={external ? '_blank' : ''}
      to={href}
    >
      <span>{icon}</span>
      {sidebarExpanded && <span className="sr-only">{title}</span>}
      <AnimatePresence>
        {sidebarExpanded && (
          <motion.div
            animate="show"
            className="whitespace-nowrap text-xs"
            exit="hidden"
            initial="hidden"
            variants={showAnimation}
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
};

export function MainNav() {
  const navigate = useNavigate();
  const logout = useAuth((state) => state.setLogout);

  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);

  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);
  const toggleSidebar = useSettings((state) => state.toggleSidebar);

  const confirmDisconnect = () => {
    setIsConfirmLogoutDialogOpened(true);
  };

  const handleDisconnect = () => {
    logout();
    navigate('/get-started');
  };

  const navigationLinks = [
    {
      title: 'Conversations',
      href: '/inboxes',
      icon: <InboxIcon className="h-5 w-5" />,
    },

    // auth?.shinkai_identity.includes('localhost') && {
    //   title: 'Create DM Chat',
    //   href: '/create-chat',
    //   icon: <ChatBubbleIcon className="h-5 w-5" />,
    // },
    {
      title: 'Agents',
      href: '/agents',
      icon: <BotIcon className="h-5 w-5" />,
    },
    {
      title: 'My AI Files Explorer',
      href: '/vector-fs',
      icon: <FilesIcon className="h-5 w-5" />,
    },
    {
      title: 'AI Files Content Search',
      href: '/vector-search',
      icon: <SearchCode className="h-5 w-5" />,
    },
    {
      title: 'Browse Public Subscriptions',
      href: '/public-subscriptions',
      icon: <Compass className="h-5 w-5" />,
    },
    {
      title: 'My Subscriptions',
      href: '/my-subscriptions',
      icon: <LibraryBig className="h-5 w-5" />,
    },
    isLocalShinkaiNodeIsUse && {
      title: 'Shinkai Node Manager',
      href: '#',
      icon: <CodesandboxIcon className="h-5 w-5" />,
      onClick: () => openShinkaiNodeManagerWindow(),
    },
  ].filter(Boolean) as NavigationLink[];

  const footerNavigationLinks = [
    {
      title: 'Settings',
      href: '/settings',
      icon: <GearIcon className="h-5 w-5" />,
    },
    {
      title: 'Disconnect',
      href: '#',
      icon: <ExitIcon className="h-5 w-5" />,
      onClick: () => confirmDisconnect(),
    },
  ] as NavigationLink[];

  return (
    <motion.aside
      animate={{
        width: sidebarExpanded ? '230px' : '70px',
        transition: sidebarTransition,
      }}
      className="fixed inset-0 z-30 flex w-auto shrink-0 flex-col gap-2 overflow-y-auto overflow-x-hidden border-r border-gray-400/30  bg-gradient-to-b from-gray-300 to-gray-400/70 px-2 py-6 shadow-xl"
      initial={{
        width: sidebarExpanded ? '230px' : '70px',
      }}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                'border-gray-350 text-gray-80 flex h-6 w-6 items-center justify-center self-center rounded-lg border bg-black/20 p-0 hover:bg-black/20 hover:text-white',
                sidebarExpanded ? 'self-end' : 'self-center',
              )}
              onClick={toggleSidebar}
              size="auto"
              type="button"
              variant="ghost"
            >
              {sidebarExpanded ? (
                <ArrowLeftToLine className="h-3 w-3" />
              ) : (
                <ArrowRightToLine className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent align="center" side="right">
              Toggle Sidebar
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1.5">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className={cn(
                    'text-gray-80 mb-3 mt-4 flex h-8 w-8 items-center justify-center gap-2 self-center rounded-full bg-white/10 hover:bg-white/10 hover:text-white',
                    sidebarExpanded &&
                      'w-full justify-start rounded-lg bg-transparent px-4 py-3 hover:bg-gray-500',
                  )}
                  onClick={() => navigate('/create-job')}
                  whileHover={{ scale: !sidebarExpanded ? 1.05 : 1 }}
                >
                  <PlusIcon className="h-5 w-5 shrink-0" />
                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        animate="show"
                        className="whitespace-nowrap text-xs"
                        exit="hidden"
                        initial="hidden"
                        variants={showAnimation}
                      >
                        Create New
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent align="center" side="right">
                  Create AI Chat
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          {navigationLinks.map((item) => {
            return (
              <TooltipProvider
                delayDuration={!sidebarExpanded ? 0 : 10000}
                key={item.title}
              >
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <NavLink
                      external={item.external}
                      href={item.href}
                      icon={item.icon}
                      onClick={item.onClick}
                      title={item.title}
                    />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      align="center"
                      arrowPadding={2}
                      side="right"
                    >
                      <p>{item.title}</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          {footerNavigationLinks.map((item) => {
            return (
              <React.Fragment key={item.title}>
                <TooltipProvider
                  delayDuration={!sidebarExpanded ? 0 : 10000}
                  key={item.title}
                >
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <NavLink
                        external={item.external}
                        href={item.href}
                        icon={item.icon}
                        onClick={item.onClick}
                        title={item.title}
                      />
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent
                        align="center"
                        arrowPadding={2}
                        side="right"
                      >
                        <p>{item.title}</p>
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </React.Fragment>
            );
          })}
        </div>
      </div>

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
          <AlertDialogFooter className="mt-4 flex gap-2">
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
    </motion.aside>
  );
}

const MainLayout = () => {
  const location = useLocation();
  const auth = useAuth((state) => state.auth);
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

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

  const disabledSidebarRoutes = [
    '/connect-ai',
    '/free-subscriptions',
    '/ai-model-installation',
  ];

  const displaySidebar =
    !!auth && !disabledSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-full flex-col bg-gray-500 text-white">
      <div className={cn('flex flex-1', !!auth && '')}>
        {displaySidebar && <MainNav />}
        <motion.div
          animate={{
            paddingLeft: !displaySidebar
              ? '0px'
              : sidebarExpanded
                ? '230px'
                : '70px',
            transition: sidebarTransition,
          }}
          className={cn('flex-1')}
          initial={{
            paddingLeft: !displaySidebar
              ? '0px'
              : sidebarExpanded
                ? '230px'
                : '70px',
          }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
export default MainLayout;
