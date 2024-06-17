import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useArchiveJob } from '@shinkai_network/shinkai-node-state/lib/mutations/archiveJob/useArchiveJob';
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AddAgentIcon,
  AgentIcon,
  AISearchContentIcon,
  AiTasksIcon,
  ArchivedIcon,
  ArchiveIcon,
  BrowseSubscriptionIcon,
  DirectoryTypeIcon,
  DisconnectIcon,
  FilesIcon,
  FileTypeIcon,
  InboxIcon,
  JobBubbleIcon,
  MySubscriptionsIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ArrowLeft, BotIcon, Menu, Settings, X, XIcon } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import visorLogo from '../../assets/icons/visor.svg';
import {
  onboardingPages,
  rootPages,
  routes,
  subPages,
} from '../../constants/routing';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { EditInboxNameDialog } from '../edit-inbox-name-dialog/edit-inbox-name-dialog';
import { Header } from '../header/header';

enum MenuOption {
  Inboxes = 'inboxes',
  CreateInbox = 'create-inbox',
  Agents = 'agents',
  AddAgent = 'add-agent',
  CreateJob = 'create-job',
  CreateAITask = '',
  NodeFiles = 'node-files',
  SearchNodeFiles = 'search-node-files',
  MySubscriptions = 'my-subscriptions',
  PublicItems = 'public-items',
  Settings = 'settings',
  Logout = 'logout',
}

const routeTitleDescriptionMapping: Record<
  string,
  { title: ReactNode; description?: ReactNode }
> = {
  [routes.CreateJob]: { title: 'Create AI Chat' },
  [routes.CreateInbox]: { title: 'Create DM Chat' },
  [routes.Inboxes]: { title: 'Chats' },
  [routes.VectorFs]: { title: 'My AI Files Explorer' },
  [routes.Subscriptions]: { title: 'My Subscriptions' },
  [routes.PublicFolders]: { title: 'Browse Public Subscriptions' },
  [routes.Settings]: { title: 'Settings' },
  [routes.Agents]: { title: 'AIs' },
  [routes.AddAgent]: { title: 'Add AI' },
  [routes.PublicKeys]: { title: 'Public Keys' },
};

const DisplayInboxName = () => {
  const currentInbox = useGetCurrentInbox();
  const [isEditInboxNameDialogOpened, setIsEditInboxNameDialogOpened] =
    useState<boolean>(false);

  const hasFolders = !!currentInbox?.job_scope?.vector_fs_folders?.length;
  const hasFiles = !!currentInbox?.job_scope?.vector_fs_items?.length;

  const hasConversationContext = hasFolders || hasFiles;

  return (
    <div className="flex flex-col items-center">
      <Button
        className="relative inline-flex h-auto max-w-[250px] bg-transparent px-2.5 py-1.5"
        onClick={() => setIsEditInboxNameDialogOpened(true)}
        variant="ghost"
      >
        <span className="line-clamp-1 text-base font-medium text-white">
          {currentInbox?.custom_name || currentInbox?.inbox_id}
        </span>
      </Button>

      {hasConversationContext && (
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              className="flex h-auto items-center gap-4 bg-transparent px-2.5 py-1.5"
              variant="ghost"
            >
              {hasFolders && (
                <span className="text-gray-80 flex items-center gap-1 text-xs font-medium">
                  <DirectoryTypeIcon className="ml-1 h-4 w-4" />
                  {currentInbox?.job_scope.vector_fs_folders.length}{' '}
                  {currentInbox?.job_scope.vector_fs_folders.length === 1
                    ? 'folder'
                    : 'folders'}
                </span>
              )}
              {hasFiles && (
                <span className="text-gray-80 flex items-center gap-1 text-xs font-medium">
                  <FileTypeIcon className="ml-1 h-4 w-4" />
                  {currentInbox?.job_scope.vector_fs_items.length}{' '}
                  {currentInbox?.job_scope.vector_fs_items.length === 1
                    ? 'file'
                    : 'files'}
                </span>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="min-h-[300px]">
            <DrawerClose className="absolute right-4 top-5">
              <XIcon className="text-gray-80" />
            </DrawerClose>
            <DrawerHeader>
              <DrawerTitle>Chat Context</DrawerTitle>
              <DrawerDescription className="mb-4 mt-2">
                List of folders and files used as context for this conversation
              </DrawerDescription>
              <div className="space-y-3 pt-4">
                {hasFolders && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">Folders</span>
                    <ul>
                      {currentInbox?.job_scope?.vector_fs_folders?.map(
                        (folder) => (
                          <li
                            className="flex items-center gap-2 py-1.5"
                            key={folder.path}
                          >
                            <DirectoryTypeIcon />
                            <div className="text-gray-80 text-sm">
                              {folder.name}
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {hasFiles && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">Files</span>
                    <ul>
                      {currentInbox?.job_scope?.vector_fs_items?.map((file) => (
                        <li
                          className="flex items-center gap-2 py-1.5"
                          key={file.path}
                        >
                          <FileTypeIcon
                            type={
                              file?.source?.Standard?.FileRef?.file_type
                                ?.Document
                            }
                          />
                          <span className="text-gray-80 text-sm">
                            {file.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      )}
      <EditInboxNameDialog
        inboxId={currentInbox?.inbox_id || ''}
        name={currentInbox?.custom_name || ''}
        onCancel={() => setIsEditInboxNameDialogOpened(false)}
        onOpenChange={setIsEditInboxNameDialogOpened}
        onSaved={() => setIsEditInboxNameDialogOpened(false)}
        open={isEditInboxNameDialogOpened}
      />
    </div>
  );
};

const ArchiveJobButton = () => {
  const currentInbox = useGetCurrentInbox();
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: archiveJob } = useArchiveJob({
    onSuccess: () => {
      toast.success('Your conversation has been archived');
    },
    onError: (error) => {
      toast.error('Error archiving job', {
        description: error.message,
      });
    },
  });

  const handleArchiveJob = async () => {
    if (!currentInbox) return;
    await archiveJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      inboxId: currentInbox.inbox_id,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              'absolute right-10 shrink-0 bg-inherit hover:bg-gray-400',
              currentInbox?.is_finished &&
                'text-gray-80 hover:bg-inherit hover:text-white',
            )}
            disabled={currentInbox?.is_finished}
            onClick={handleArchiveJob}
            size={'icon'}
            variant={'ghost'}
          >
            {currentInbox?.is_finished ? (
              <ArchivedIcon className="h-4 w-4" />
            ) : (
              <ArchiveIcon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent sideOffset={0}>
            <p>{currentInbox?.is_finished ? 'Archived' : 'Archive'}</p>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function NavBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const setLastPage = useSettings((state) => state.setLastPage);

  const setAuth = useAuth((state) => state.setAuth);
  const auth = useAuth((state) => state.auth);
  const [isMenuOpened, setMenuOpened] = useState(false);

  const isInboxPage =
    location.pathname.includes('/inboxes/job_inbox') ||
    location.pathname.includes('/inboxes/inbox');

  const isRootPage = rootPages.some((value) =>
    location.pathname.match(`${value}$`),
  );
  const isSubPage =
    subPages.some((value) => location.pathname.match(`${value}$`)) ||
    location.pathname.includes('/inboxes/');

  const isOnboardingPage = onboardingPages.some((value) =>
    location.pathname.match(`${value}$`),
  );

  const isJobInbox = location.pathname.includes('/inboxes/job_inbox');

  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);

  const goBack = () => {
    if (
      location.pathname.includes('/inboxes/') ||
      location.pathname.includes('/agents')
    ) {
      navigate('/inboxes');
      return;
    }
    navigate(-1);
  };
  const logout = (): void => {
    setAuth(null);
  };

  const onClickMenuOption = (key: MenuOption) => {
    switch (key) {
      case MenuOption.Inboxes:
        navigate(routes.Inboxes);
        setLastPage(routes.Inboxes);
        break;
      case MenuOption.CreateInbox:
        navigate(routes.CreateInbox);
        setLastPage(routes.CreateInbox);
        break;
      case MenuOption.CreateAITask:
        navigate(routes.CreateAITask);
        setLastPage(routes.CreateAITask);
        break;
      case MenuOption.CreateJob:
        navigate(routes.CreateJob);
        setLastPage(routes.CreateJob);
        break;
      case MenuOption.NodeFiles:
        navigate(routes.VectorFs);
        setLastPage(routes.VectorFs);
        break;
      case MenuOption.SearchNodeFiles:
        navigate(routes.SearchNodeFiles);
        setLastPage(routes.SearchNodeFiles);
        break;
      case MenuOption.MySubscriptions:
        navigate(routes.Subscriptions);
        setLastPage(routes.Subscriptions);
        break;
      case MenuOption.PublicItems:
        navigate(routes.PublicFolders);
        setLastPage(routes.PublicFolders);
        break;
      case MenuOption.Agents:
        navigate(routes.Agents);
        setLastPage(routes.Agents);
        break;
      case MenuOption.AddAgent:
        navigate(routes.AddAgent);
        setLastPage(routes.AddAgent);
        break;
      case MenuOption.Settings:
        navigate(routes.Settings);
        setLastPage(routes.Settings);
        break;
      case MenuOption.Logout:
        setIsConfirmLogoutDialogOpened(true);
        break;
      default:
        break;
    }
  };

  const renderHeaderContent = () => {
    const routeTitleDescription =
      routeTitleDescriptionMapping[location.pathname as MenuOption];

    if (isOnboardingPage) {
      return (
        <img
          alt="shinkai-app-logo"
          className="mb-2 ml-auto mr-auto w-[100px]"
          src={srcUrlResolver(visorLogo)}
        />
      );
    }
    if (isSubPage)
      return (
        <>
          <div className="flex items-center gap-3">
            <Button
              className="flex-none"
              onClick={goBack}
              size="icon"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {!isInboxPage && routeTitleDescription && (
              <Header
                description={routeTitleDescription?.description}
                title={routeTitleDescription?.title}
              />
            )}
          </div>
          {isInboxPage && <DisplayInboxName />}
        </>
      );

    if (isRootPage && routeTitleDescription) {
      return (
        <Header
          description={routeTitleDescription?.description}
          title={routeTitleDescription?.title}
        />
      );
    }
    return null;
  };

  return (
    <nav className="pb-2.5">
      <AlertDialog open={isConfirmLogoutDialogOpened}>
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
                  Before continuing, please
                  <Link
                    className="mx-1 inline-block cursor-pointer text-white underline"
                    to={'/settings/export-connection'}
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
              onClick={() => setIsConfirmLogoutDialogOpened(false)}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1" onClick={() => logout()}>
              {t('common.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div
        className={cn(
          'flex items-center justify-between',
          renderHeaderContent() == null && 'justify-end',
        )}
      >
        {renderHeaderContent()}
        {auth && (
          <div className="relative">
            {isJobInbox && <ArchiveJobButton />}
            <DropdownMenu
              modal={false}
              onOpenChange={(value) => setMenuOpened(value)}
              open={isMenuOpened}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid="nav-menu-button"
                  size="icon"
                  variant="ghost"
                >
                  {!isMenuOpened ? (
                    <Menu className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                alignOffset={-8}
                className="w-[280px] space-y-2.5 rounded-br-none rounded-tr-none"
                sideOffset={10}
              >
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.Inboxes)}
                >
                  <InboxIcon className="mr-2 h-4 w-4" />
                  <span>{t('layout.menuItems.chats')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="nav-menu-create-job-button"
                  onClick={() => onClickMenuOption(MenuOption.CreateJob)}
                >
                  <JobBubbleIcon className="mr-2 h-4 w-4" />
                  <span>{t('chat.create')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="py-0"
                  disabled={true}
                  onClick={() => onClickMenuOption(MenuOption.CreateAITask)}
                >
                  <AiTasksIcon className="mr-2 h-4 w-4" />
                  <span className="mr-3">{t('layout.menuItems.aiTasks')}</span>
                  <Badge
                    className="text-[10px] uppercase"
                    variant="inputAdornment"
                  >
                    {t('common.soon')}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />

                {/*{auth?.shinkai_identity.includes('localhost') ? null : (*/}
                {/*  <DropdownMenuItem*/}
                {/*    onClick={() => onClickMenuOption(MenuOption.CreateInbox)}*/}
                {/*  >*/}
                {/*    <ChatBubbleIcon className="mr-2 h-4 w-4" />*/}
                {/*    <span>*/}
                {/*      <FormattedMessage id="create-inbox" />*/}
                {/*    </span>*/}
                {/*  </DropdownMenuItem>*/}
                {/*)}*/}

                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.NodeFiles)}
                >
                  <FilesIcon className="mr-2 h-4 w-4" />
                  <span>{t('layout.menuItems.vectorFs')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.SearchNodeFiles)}
                >
                  <AISearchContentIcon className="mr-2 h-4 w-4" />
                  <span>{t('layout.menuItems.vectorSearch')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem
                  className="py-0.5"
                  disabled={true}
                  onClick={() => onClickMenuOption(MenuOption.PublicItems)}
                >
                  <BrowseSubscriptionIcon className="mr-2 h-4 w-4" />
                  <span className="mr-3">
                    {t('layout.menuItems.subscriptions')}
                  </span>
                  <Badge
                    className="text-[10px] uppercase"
                    variant="inputAdornment"
                  >
                    {t('common.soon')}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="py-0.5"
                  disabled={true}
                  onClick={() => onClickMenuOption(MenuOption.MySubscriptions)}
                >
                  <MySubscriptionsIcon className="mr-2 h-4 w-4" />
                  <span className="mr-3">
                    {t('layout.menuItems.mySubscriptions')}
                  </span>
                  <Badge
                    className="text-[10px] uppercase"
                    variant="inputAdornment"
                  >
                    {t('common.soon')}
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-200" />

                <DropdownMenuItem
                  data-testid="nav-menu-agents-button"
                  onClick={() => onClickMenuOption(MenuOption.Agents)}
                >
                  <BotIcon className="mr-2 h-4 w-4" />
                  <span>{t('layout.menuItems.agents')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.Settings)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('layout.menuItems.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.Logout)}
                >
                  <DisconnectIcon className="mr-2 h-4 w-4" />
                  <span>{t('layout.menuItems.disconnect')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}
