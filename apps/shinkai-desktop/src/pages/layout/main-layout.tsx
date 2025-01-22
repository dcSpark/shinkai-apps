import { ExitIcon, GearIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useImportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/importTool/useImportTool';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/v2/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/v2/queries/getEncryptionKeys/useGetEncryptionKeys';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
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
  // AiTasksIcon,
  // BrowseSubscriptionIcon,
  CreateAIIcon,
  FilesIcon,
  InboxIcon,
  ScheduledTasksIcon,
  // MySubscriptionsIcon,
  SheetIcon,
  ShinkaiCombinationMarkIcon,
  ToolsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { submitRegistrationNoCodeError } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { AnimatePresence, motion, TargetAndTransition } from 'framer-motion';
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  BotIcon,
  XIcon,
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
import OnboardingStepper from '../../components/onboarding-checklist/onboarding';
import config from '../../config';
import {
  useShinkaiNodeKillMutation,
  useShinkaiNodeRemoveStorageMutation,
  useShinkaiNodeSpawnMutation,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';

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
  const { t } = useTranslation();
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
              className="flex items-center gap-3 overflow-hidden whitespace-nowrap text-xs"
              exit="hidden"
              initial="hidden"
              variants={showAnimation}
            >
              <span className="max-w-[100px] truncate">{title} </span>
              <Badge className="text-[10px] uppercase" variant="inputAdornment">
                {t('common.soon')}
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
            className="overflow-hidden whitespace-nowrap text-xs"
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

export const ResetConnectionDialog = ({
  isOpen,
  onOpenChange,
  allowClose = false,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allowClose?: boolean;
}) => {
  const { mutateAsync: shinkaiNodeKill, isPending: isShinkaiNodeKillPending } =
    useShinkaiNodeKillMutation();
  const {
    mutateAsync: shinkaiNodeSpawn,
    isPending: isShinkaiNodeSpawnPending,
  } = useShinkaiNodeSpawnMutation({
    onSuccess: async () => {
      if (!encryptionKeys) return;
      await submitRegistrationNoCode({
        profile: 'main',
        registration_name: 'main_device',
        node_address: 'http://127.0.0.1:9550',
        ...encryptionKeys,
      });
    },
  });
  const {
    mutateAsync: shinkaiNodeRemoveStorage,
    isPending: isShinkaiNodeRemoveStoragePending,
  } = useShinkaiNodeRemoveStorageMutation();
  const { setShinkaiNodeOptions } = useShinkaiNodeManager();
  const { encryptionKeys } = useGetEncryptionKeys();
  const setAuth = useAuth((state) => state.setAuth);
  const navigate = useNavigate();

  const isResetLoading =
    isShinkaiNodeKillPending ||
    isShinkaiNodeRemoveStoragePending ||
    isShinkaiNodeSpawnPending;

  const { mutateAsync: submitRegistrationNoCode } = useSubmitRegistrationNoCode(
    {
      onSuccess: (response, setupPayload) => {
        if (response.status !== 'success') {
          shinkaiNodeKill();
        }
        if (response.status === 'success' && encryptionKeys) {
          const updatedSetupData = {
            ...encryptionKeys,
            ...setupPayload,
            permission_type: '',
            shinkai_identity: response.data?.node_name ?? '',
            node_signature_pk: response.data?.identity_public_key ?? '',
            node_encryption_pk: response.data?.encryption_public_key ?? '',
            api_v2_key: response.data?.api_v2_key ?? '',
          };
          setAuth(updatedSetupData);
          navigate('/ai-model-installation');
          onOpenChange(false);
        } else {
          submitRegistrationNoCodeError();
        }
      },
    },
  );

  const handleReset = async () => {
    await shinkaiNodeKill();
    useAuth.getState().setLogout(); // clean up local storage
    await shinkaiNodeRemoveStorage({ preserveKeys: true });
    setShinkaiNodeOptions(null);
    await shinkaiNodeSpawn();
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={isOpen}>
      <AlertDialogContent className="w-[75%]">
        {allowClose && (
          <AlertDialogCancel
            className="absolute right-3 top-3 border-0"
            disabled={isResetLoading}
          >
            <XIcon className="h-4 w-4" />
          </AlertDialogCancel>
        )}
        <AlertDialogHeader>
          <AlertDialogTitle>App Reset Required</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col space-y-3 text-left text-white/70">
              <div className="text-sm">
                We&apos;re currently in beta and we made some significant updates to
                improve your experience. To apply these updates, we need to
                reset your data.
                <br /> <br />
                If you need assistance, please contact our support team.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2.5">
          <Button
            className="min-w-32 text-sm"
            disabled={isResetLoading}
            isLoading={isResetLoading}
            onClick={handleReset}
            size="sm"
            variant={'destructive'}
          >
            Reset App
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export function MainNav() {
  const { t, Trans } = useTranslation();
  const optInExperimental = useSettings((state) => state.optInExperimental);
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const logout = useAuth((state) => state.setLogout);
  const isGetStartedChecklistHidden = useSettings(
    (state) => state.isGetStartedChecklistHidden,
  );

  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);
  const [isApiV2KeyMissingDialogOpen, setIsApiV2KeyMissingDialogOpen] =
    useState(false);

  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);
  const toggleSidebar = useSettings((state) => state.toggleSidebar);

  const confirmDisconnect = () => {
    setIsConfirmLogoutDialogOpened(true);
  };

  useEffect(() => {
    if (!auth?.api_v2_key) {
      setIsApiV2KeyMissingDialogOpen(true);
    }
  }, [auth?.api_v2_key]);

  const handleDisconnect = () => {
    logout();
    navigate('/get-started');
  };

  const navigationLinks = [
    {
      title: t('layout.menuItems.chats'),
      href: '/inboxes',
      icon: <InboxIcon className="h-5 w-5" />,
    },
    // {
    //   title: t('layout.menuItems.aiTasks'),
    //   href: '/ai-tasks',
    //   icon: <AiTasksIcon className="h-5 w-5" />,
    //   disabled: true,
    // },
    // auth?.shinkai_identity.includes('localhost') && {
    //   title: 'Create DM Chat',
    //   href: '/create-chat',
    //   icon: <ChatBubbleIcon className="h-5 w-5" />,
    // },

    {
      title: t('layout.menuItems.vectorFs'),
      href: '/vector-fs',
      icon: <FilesIcon className="h-5 w-5" />,
    },
    config.isDev && {
      title: t('layout.menuItems.vectorSearch'),
      href: '/vector-search',
      icon: <AISearchContentIcon className="h-5 w-5" />,
    },

    // {
    //   title: t('layout.menuItems.subscriptions'),
    //   href: '/public-subscriptions',
    //   icon: <BrowseSubscriptionIcon className="h-5 w-5" />,
    // },
    // {
    //   title: t('layout.menuItems.mySubscriptions'),
    //   href: '/my-subscriptions',
    //   icon: <MySubscriptionsIcon className="h-5 w-5" />,
    // },
    {
      title: 'Shinkai Tools',
      href: '/tools',
      icon: <ToolsIcon className="h-5 w-5" />,
    },
    {
      title: 'Scheduled Tasks',
      href: '/tasks',
      icon: <ScheduledTasksIcon className="h-5 w-5" />,
    },
    optInExperimental && {
      title: 'Shinkai Sheet',
      href: '/sheets',
      icon: <SheetIcon className="h-5 w-5" />,
    },
  ].filter(Boolean) as NavigationLink[];

  const footerNavigationLinks = [
    {
      title: t('layout.menuItems.agents'),
      href: '/ais',
      icon: <BotIcon className="h-5 w-5" />,
    },
    {
      title: t('layout.menuItems.settings'),
      href: '/settings',
      icon: <GearIcon className="h-5 w-5" />,
    },
    config.isDev && {
      title: t('layout.menuItems.disconnect'),
      href: '#',
      icon: <ExitIcon className="h-5 w-5" />,
      onClick: () => confirmDisconnect(),
    },
  ].filter(Boolean) as NavigationLink[];

  return (
    <motion.aside
      animate={{
        width: sidebarExpanded ? '230px' : '70px',
      }}
      className="relative z-30 flex w-auto shrink-0 flex-col gap-2 overflow-y-auto overflow-x-hidden border-r border-gray-400/30 bg-gradient-to-b from-gray-300 to-gray-400/70 px-2 py-6 pt-9 shadow-xl"
      exit={{ width: 0, opacity: 0 }}
      initial={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-gray-80 flex w-full items-center justify-between gap-2 py-2 pl-4">
        {sidebarExpanded && (
          <ShinkaiCombinationMarkIcon className="text-gray-80 h-auto w-[80px]" />
        )}

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
              {t('layout.sidebar.toggle')}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1.5">
          {!isGetStartedChecklistHidden && <OnboardingStepper />}

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                className={cn(
                  'text-gray-80 mb-1.5 mt-4 flex h-8 items-center gap-2 bg-white/10 hover:bg-white/10 hover:text-white',
                  sidebarExpanded
                    ? 'w-full justify-start rounded-lg bg-transparent px-4 py-3 hover:bg-gray-500'
                    : 'w-8 justify-center self-center rounded-full',
                )}
                onClick={() => navigate('/inboxes')}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: !sidebarExpanded ? 1.05 : 1 }}
              >
                <CreateAIIcon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {sidebarExpanded && (
                    <motion.span
                      animate="show"
                      className="overflow-hidden whitespace-nowrap text-xs"
                      exit="hidden"
                      initial="hidden"
                      variants={showAnimation}
                    >
                      {t('chat.create')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                align="center"
                className="flex flex-col items-center gap-1"
                side="right"
              >
                <span>{t('chat.create')}</span>
                <div className="text-gray-80 flex items-center justify-center gap-2 text-center">
                  <span>⌘</span>
                  <span>N</span>
                </div>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>

          {navigationLinks.map((item) => {
            return (
              <Fragment key={item.title}>
                {optInExperimental && item.href === '/sheets' && (
                  <Separator className="my-0.5 w-full bg-gray-200" />
                )}
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
                                {t('common.comingSoon')}
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

      <ResetConnectionDialog
        isOpen={isApiV2KeyMissingDialogOpen}
        onOpenChange={setIsApiV2KeyMissingDialogOpen}
      />
      <AlertDialog
        onOpenChange={setIsConfirmLogoutDialogOpened}
        open={isConfirmLogoutDialogOpened}
      >
        <AlertDialogContent className="w-[75%]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('disconnect.modalTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col space-y-3 text-left text-white/70">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm">
                    {t('disconnect.modalDescription')}
                  </span>
                </div>
                <div className="text-sm">
                  <Trans
                    components={{
                      Link: (
                        <Link
                          className="mx-0.5 inline-block cursor-pointer text-white underline"
                          onClick={() => {
                            setIsConfirmLogoutDialogOpened(false);
                          }}
                          to={'/settings/export-connection'}
                        />
                      ),
                    }}
                    i18nKey="disconnect.exportConnection"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel
              className="mt-0 min-w-[120px]"
              onClick={() => {
                setIsConfirmLogoutDialogOpened(false);
              }}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-w-[120px]"
              onClick={handleDisconnect}
            >
              {t('common.disconnect')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.aside>
  );
}

const MainLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const [needsResetApp, setNeedsResetApp] = useState(false);
  const { nodeInfo, isSuccess, isFetching } = useGetHealth(
    { nodeAddress: auth?.node_address ?? '' },
    { refetchInterval: 35000, enabled: !!auth },
  );

  const { mutateAsync: importTool } = useImportTool({
    onSuccess: (data) => {
      toast.success('Tool imported successfully', {
        action: {
          label: 'View',
          onClick: () => {
            navigate(`/tools/${data.tool_key}`);
          },
        },
      });
      navigate('/tools');
    },
    onError: (error) => {
      toast.error('Failed to import tool', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  useEffect(() => {
    const unlisten = listen('store-deep-link', (event) => {
      if (!auth) return;

      const payload = event.payload as { tool_type: string; tool_url: string };
      if (payload.tool_type === 'tool') {
        importTool({
          nodeAddress: auth?.node_address ?? '',
          token: auth?.api_v2_key ?? '',
          url: payload.tool_url,
        });
      }
    });

    getCurrentWindow().emit('shinkai-app-ready');
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [importTool, auth]);

  useEffect(() => {
    if (isSuccess && nodeInfo?.status !== 'ok') {
      toast.error(t('errors.nodeUnavailable.title'), {
        description: t('errors.nodeUnavailable.description'),
        important: true,
        id: 'node-unavailable',
        duration: 20000,
      });
    }
    if (isSuccess && nodeInfo?.status === 'ok') {
      toast.dismiss('node-unavailable');
    }
    if (isSuccess && nodeInfo?.update_requires_reset) {
      setNeedsResetApp(true);
    } else {
      setNeedsResetApp(false);
    }
  }, [isSuccess, nodeInfo, isFetching, t]);

  const disabledSidebarRoutes = [
    '/connect-ai',
    '/free-subscriptions',
    '/ai-model-installation',
    '/get-started',
  ];

  const displaySidebar =
    !!auth && !disabledSidebarRoutes.includes(location.pathname);

  return (
    <div className="relative flex h-screen min-h-full flex-col overflow-hidden bg-gray-500 text-white">
      <div
        className="absolute top-0 z-50 h-6 w-full"
        data-tauri-drag-region={true}
      />
      <div className={cn('flex h-full flex-1', !!auth && '')}>
        <AnimatePresence initial={false}>
          {displaySidebar && <MainNav />}
        </AnimatePresence>
        <div className={cn('min-h-full flex-1 overflow-auto')}>
          <Outlet />
        </div>
      </div>
      <ResetConnectionDialog
        isOpen={needsResetApp}
        onOpenChange={setNeedsResetApp}
      />
    </div>
  );
};
export default MainLayout;
