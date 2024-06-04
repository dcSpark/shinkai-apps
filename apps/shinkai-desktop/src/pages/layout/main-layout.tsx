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
  Badge,
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AISearchContentIcon,
  AiTasksIcon,
  BrowseSubscriptionIcon,
  FilesIcon,
  InboxIcon,
  MySubscriptionsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  BotIcon,
  PlusIcon,
} from 'lucide-react';
import React, { Fragment, useEffect, useState } from 'react';
import {
  Link,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';

import { ResourcesBanner } from '../../components/hardware-capabilities/resources-banner';
import { UpdateBanner } from '../../components/hardware-capabilities/update-banner';
import OnboardingStepper from '../../components/onboarding/onboarding';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

type NavigationLink = {
  title: string;
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
  disabled?: boolean;
};

export const sidebarTransition: TargetAndTransition['transition'] = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

export const showAnimation = {
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
  disabled,
}: {
  href: string;
  external?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
  disabled?: boolean;
}) => {
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const isMatch = useMatch({
    path: href,
    end: false,
  });

  if (disabled) {
    return (
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-4 py-3 text-white transition-colors',
          'opacity-40',
        )}
      >
        <span>{icon}</span>
        {sidebarExpanded && <span className="sr-only">{title}</span>}
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              animate="show"
              className="flex items-center gap-3 whitespace-nowrap text-xs"
              exit="hidden"
              initial="hidden"
              variants={showAnimation}
            >
              <span className="max-w-[100px] truncate">{title} </span>
              <Badge className="text-[10px]" variant="inputAdornment">
                SOON
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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

const ShinkaiLogo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    height="60"
    viewBox="0 0 194 60"
    width="184"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M35.9269 46.3536C35.65 45.3274 34.9038 44.8299 33.8628 44.9314C31.8474 45.1268 31.1782 44.4808 30.2218 43.0613C32.7423 43.5952 34.3679 42.9389 34.8756 42.6471C35.5295 42.2694 36.191 41.785 35.9295 40.9306C35.6731 40.0945 34.9038 39.9278 34.1141 40.0789C32.9936 40.2925 31.9192 40.4175 31.0474 39.3261C31.232 39.1594 31.4166 38.9875 31.6064 38.8234C32.0705 38.4249 32.4295 37.9561 32.1936 37.3231C31.9679 36.7188 31.3961 36.3724 30.8141 36.4792C30.3397 36.5678 29.3884 36.8647 29.0987 36.3802L29.1115 36.375C29.0013 36.349 28.832 35.8957 28.7961 35.5649C28.6269 33.9474 29.3269 32.395 30.2705 31.1057C31.4474 29.5038 32.2551 27.7378 32.6141 25.7791C33.1756 22.7055 32.5807 19.8456 30.9192 17.2174C28.9474 14.097 26.1679 12.0419 22.509 11.2865C21.65 11.1094 20.8115 11.0156 19.9987 11C19.1833 11.0156 18.3474 11.1094 17.4884 11.2865C13.832 12.0419 11.05 14.097 9.07818 17.2174C7.41921 19.8456 6.82434 22.7055 7.38331 25.7791C7.73972 27.7404 8.54998 29.5038 9.7269 31.1057C10.6731 32.395 11.3731 33.9448 11.2013 35.5649C11.1654 35.8957 10.9961 36.349 10.8859 36.375L10.8987 36.3802C10.609 36.8621 9.66023 36.5678 9.18331 36.4792C8.60382 36.3724 8.02946 36.7188 7.80382 37.3231C7.56793 37.9561 7.92434 38.4249 8.391 38.8234C8.58075 38.9875 8.76536 39.1594 8.94998 39.3261C8.07818 40.4175 7.00126 40.2925 5.88331 40.0789C5.09357 39.9278 4.32434 40.0945 4.06793 40.9306C3.80639 41.785 4.46793 42.2694 5.12177 42.6471C5.6269 42.9389 7.25511 43.5926 9.77562 43.0613C8.81921 44.4808 8.14998 45.1268 6.13459 44.9314C5.09357 44.8299 4.34485 45.3274 4.07049 46.3536C3.80126 47.3564 4.33203 48.0753 5.17305 48.5546C5.72434 48.8672 6.33972 48.9896 6.991 49C10.5577 49.0495 13.5013 47.5778 16.1525 45.3638C17.6115 44.1448 18.8115 43.5275 20.0013 43.5119C21.191 43.5275 22.3884 44.1448 23.85 45.3638C26.5013 47.5778 29.4448 49.0495 33.0115 49C33.6628 48.9922 34.2782 48.8672 34.8295 48.5546C35.6731 48.0753 36.2013 47.3564 35.932 46.3536H35.9269ZM15.0756 34.2027C13.9731 34.2001 13.0628 33.278 13.0602 32.1658C13.0602 31.0328 13.9807 30.1055 15.1166 30.0951C16.1961 30.0847 17.1577 31.1083 17.1474 32.257C17.1372 33.3952 16.2705 34.2079 15.0756 34.2027ZM24.9192 34.2027C23.7218 34.2079 22.8577 33.3926 22.8474 32.257C22.8372 31.1083 23.8013 30.0847 24.8782 30.0951C26.0141 30.1081 26.9346 31.0354 26.9346 32.1658C26.9346 33.278 26.0218 34.2001 24.9192 34.2027Z"
      fill="currentColor"
    />
    <path
      d="M190.321 21.0721C188.249 21.0721 186.599 19.3942 186.599 17.2859C186.599 15.1777 188.249 13.5428 190.321 13.5428C192.351 13.5428 194 15.1777 194 17.2859C194 19.3942 192.351 21.0721 190.321 21.0721ZM187.107 45.9404V24.4281H193.62V45.9404H187.107Z"
      fill="currentColor"
    />
    <path
      d="M169.621 46.5C165.138 46.5 162.347 43.8325 162.347 39.6161C162.347 35.6578 165.096 33.2054 170.171 32.8182L176.092 32.3449V32.0007C176.092 29.8925 174.823 28.7738 172.497 28.7738C169.748 28.7738 168.268 29.8494 168.268 31.7856H162.855C162.855 26.9238 166.788 23.7399 172.835 23.7399C178.967 23.7399 182.435 27.2249 182.435 33.3775V45.9407H176.684L176.261 43.1011C175.584 45.0802 172.793 46.5 169.621 46.5ZM171.905 41.5952C174.4 41.5952 176.134 40.3475 176.134 37.8951V36.7334L172.835 37.0346C170.002 37.2927 168.987 37.9381 168.987 39.3149C168.987 40.8638 169.917 41.5952 171.905 41.5952Z"
      fill="currentColor"
    />
    <path
      d="M146.373 45.9407H139.86V13.5H146.373V32.1728L153.224 24.4283H161.386L153.435 32.9472L161.132 45.9407H153.604L148.868 37.895L146.373 40.5626V45.9407Z"
      fill="currentColor"
    />
    <path
      d="M120.725 45.9407H114.213V24.4283H120.345L120.768 26.6656C122.079 24.8155 124.489 23.7399 127.238 23.7399C132.271 23.7399 135.189 27.0098 135.189 32.6461V45.9407H128.676V34.238C128.676 31.5274 127.196 29.7634 124.954 29.7634C122.375 29.7634 120.725 31.4844 120.725 34.1519V45.9407Z"
      fill="currentColor"
    />
    <path
      d="M106.028 21.0721C103.956 21.0721 102.306 19.3942 102.306 17.2859C102.306 15.1777 103.956 13.5428 106.028 13.5428C108.058 13.5428 109.707 15.1777 109.707 17.2859C109.707 19.3942 108.058 21.0721 106.028 21.0721ZM102.814 45.9404V24.4281H109.327V45.9404H102.814Z"
      fill="currentColor"
    />
    <path
      d="M83.6796 45.9407H77.1668V13.5H83.7219V26.6656C85.033 24.8155 87.4435 23.7399 90.1925 23.7399C95.2251 23.7399 98.1432 27.0098 98.1432 32.646V45.9407H91.6304V34.2379C91.6304 31.5274 90.1502 29.7634 87.9087 29.7634C85.329 29.7634 83.6796 31.4844 83.6796 34.1519V45.9407Z"
      fill="currentColor"
    />
    <path
      d="M50.4652 23.3527C50.4652 17.5874 55.2441 13.5 61.9683 13.5C68.6926 13.5 72.9217 17.2862 72.9217 23.3096H66.1129C66.1129 21.0724 64.4635 19.6956 61.8838 19.6956C59.0926 19.6956 57.3163 20.9863 57.3163 23.0945C57.3163 25.0306 58.289 25.9772 60.4882 26.4505L65.1825 27.44C70.7649 28.6017 73.4292 31.3123 73.4292 36.3462C73.4292 42.4987 68.6926 46.5 61.5031 46.5C54.5251 46.5 50 42.6708 50 36.6904H56.8088C56.8088 39.0137 58.5005 40.3044 61.5454 40.3044C64.6327 40.3044 66.5781 39.0567 66.5781 37.0346C66.5781 35.2705 65.7745 34.367 63.7023 33.9368L58.9234 32.9472C53.341 31.7855 50.4652 28.5587 50.4652 23.3527Z"
      fill="currentColor"
    />
  </svg>
);

export function MainNav() {
  const navigate = useNavigate();
  const logout = useAuth((state) => state.setLogout);
  const isGetStartedChecklistHidden = useSettings(
    (state) => state.isGetStartedChecklistHidden,
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
      title: 'Chats',
      href: '/inboxes',
      icon: <InboxIcon className="h-5 w-5" />,
    },
    {
      title: 'AI Tasks',
      href: '/ai-tasks',
      icon: <AiTasksIcon className="h-5 w-5" />,
      disabled: true,
    },
    // auth?.shinkai_identity.includes('localhost') && {
    //   title: 'Create DM Chat',
    //   href: '/create-chat',
    //   icon: <ChatBubbleIcon className="h-5 w-5" />,
    // },

    {
      title: 'My AI Files Explorer',
      href: '/vector-fs',
      icon: <FilesIcon className="h-5 w-5" />,
    },
    {
      title: 'AI Files Content Search',
      href: '/vector-search',
      icon: <AISearchContentIcon className="h-5 w-5" />,
    },
    {
      title: 'Browse Subscriptions',
      href: '/public-subscriptions',
      icon: <BrowseSubscriptionIcon className="h-5 w-5" />,
      disabled: import.meta.env.PROD,
    },
    {
      title: 'My Subscriptions',
      href: '/my-subscriptions',
      icon: <MySubscriptionsIcon className="h-5 w-5" />,
      disabled: import.meta.env.PROD,
    },
  ].filter(Boolean) as NavigationLink[];

  const footerNavigationLinks = [
    {
      title: 'AIs',
      href: '/agents',
      icon: <BotIcon className="h-5 w-5" />,
    },
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
      <div className="text-gray-80 flex w-full items-center justify-between gap-2 py-2 pl-4">
        {sidebarExpanded && (
          <ShinkaiLogo className="text-gray-80 h-auto w-[80px]" />
        )}

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  'border-gray-350 text-gray-80 h-6 w-6 shrink-0 rounded-lg border bg-black/20 p-0 hover:bg-black/20 hover:text-white',
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
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1.5">
          {!isGetStartedChecklistHidden && <OnboardingStepper />}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className={cn(
                    'text-gray-80 mb-1.5 mt-4 flex h-8 w-8 items-center justify-center gap-2 self-center rounded-full bg-white/10 hover:bg-white/10 hover:text-white',
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
                        Create AI Chat
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
              <Fragment key={item.title}>
                <TooltipProvider
                  delayDuration={
                    item.disabled ? 0 : !sidebarExpanded ? 0 : 10000
                  }
                  key={item.title}
                >
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1">
                      <NavLink
                        disabled={item.disabled}
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
                        <p>
                          {item.disabled ? (
                            <>
                              {item.title} <br />
                              <span className="text-gray-80 text-xs">
                                Coming Soon - Early July
                              </span>
                            </>
                          ) : (
                            item.title
                          )}
                        </p>
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
                {(item.href === '/ai-tasks' ||
                  item.href === '/vector-search') && (
                  <Separator className="my-0.5 w-full bg-gray-200" />
                )}
              </Fragment>
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          <ResourcesBanner isInSidebar />
          <UpdateBanner />
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
    '/get-started',
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
