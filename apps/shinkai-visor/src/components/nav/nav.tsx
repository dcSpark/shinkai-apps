import { useArchiveJob } from '@shinkai_network/shinkai-node-state/lib/mutations/archiveJob/useArchiveJob';
import {
  AddAgentIcon,
  AgentIcon,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ArchivedIcon,
  ArchiveIcon,
  Badge,
  Button,
  ChatBubbleIcon,
  DirectoryTypeIcon,
  DisconnectIcon,
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
  DropdownMenuTrigger,
  FilesIcon,
  FileTypeIcon,
  InboxIcon,
  JobBubbleIcon,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ArrowLeft, Menu, Settings, X, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import visorLogo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth/auth';
import { EditInboxNameDialog } from '../edit-inbox-name-dialog/edit-inbox-name-dialog';

enum MenuOption {
  Inbox = 'inbox',
  CreateInbox = 'create-inbox',
  Agents = 'agents',
  AddAgent = 'add-agent',
  CreateJob = 'create-job',
  NodeFiles = 'node-files',
  Settings = 'settings',
  Logout = 'logout',
}

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
              <DrawerTitle>Conversation Context</DrawerTitle>
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
                          <FileTypeIcon />
                          <span className="text-gray-80 text-sm">
                            {file.name}
                          </span>
                          <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                            {file?.source?.Reference?.FileRef?.file_type
                              ?.Document ?? '-'}
                          </Badge>
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
                'text-gray-80 hover:bg-inherit hover:text-white ',
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
  const history = useHistory();
  const location = useLocation();

  const setAuth = useAuth((state) => state.setAuth);
  const auth = useAuth((state) => state.auth);
  const [isMenuOpened, setMenuOpened] = useState(false);
  const isRootPage = [
    '/inboxes',
    '/agents',
    '/settings',
    '/nodes/connect/method/quick-start',
    '/node-files',
  ].includes(location.pathname);

  const isInboxPage = location.pathname.includes('/inboxes');
  const isJobInbox = location.pathname.includes('/inboxes/job_inbox');

  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);

  const goBack = () => {
    if (!isInboxPage) {
      history.goBack();
      return;
    }
    history.push('/inboxes');
  };
  const logout = (): void => {
    setAuth(null);
  };

  const onClickMenuOption = (key: MenuOption) => {
    switch (key) {
      case MenuOption.Inbox:
        history.push('/inboxes');
        break;
      case MenuOption.CreateInbox:
        history.push('/inboxes/create-inbox');
        break;
      case MenuOption.CreateJob:
        history.push('/inboxes/create-job');
        break;
      case MenuOption.NodeFiles:
        history.push('/node-files');
        break;
      case MenuOption.Agents:
        history.push('/agents');
        break;
      case MenuOption.AddAgent:
        history.push('/agents/add');
        break;
      case MenuOption.Settings:
        history.push('/settings');
        break;
      case MenuOption.Logout:
        setIsConfirmLogoutDialogOpened(true);
        break;
      default:
        break;
    }
  };

  return (
    <nav className="">
      <AlertDialog open={isConfirmLogoutDialogOpened}>
        <AlertDialogContent className="w-[75%]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              <FormattedMessage id="are-you-sure" />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col space-y-3 text-left text-white/70">
                <div className="flex flex-col space-y-1 ">
                  <span className="text-sm">
                    <FormattedMessage id="permanently-lose-connection" />
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
              <FormattedMessage id="cancel" />
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1" onClick={() => logout()}>
              <FormattedMessage id="continue" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="relative flex items-center justify-between">
        <div
          className={`flex-none ${
            isRootPage || history.length <= 1 ? 'invisible' : ''
          }`}
        >
          <Button onClick={() => goBack()} size="icon" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        {isInboxPage ? (
          <DisplayInboxName />
        ) : (
          <img
            alt="shinkai-app-logo"
            className="absolute left-0 right-0 ml-auto mr-auto w-[100px]"
            src={srcUrlResolver(visorLogo)}
          />
        )}
        {auth && (
          <DropdownMenu
            modal={false}
            onOpenChange={(value) => setMenuOpened(value)}
            open={isMenuOpened}
          >
            <DropdownMenuTrigger asChild>
              <Button data-testid="nav-menu-button" size="icon" variant="ghost">
                {!isMenuOpened ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              alignOffset={-22}
              className="w-[300px] space-y-2.5 rounded-br-none rounded-tr-none"
              sideOffset={10}
            >
              <DropdownMenuLabel>
                <FormattedMessage id="inbox.other" />
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onClickMenuOption(MenuOption.Inbox)}
              >
                <InboxIcon className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="inbox.other" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="nav-menu-create-job-button"
                onClick={() => onClickMenuOption(MenuOption.CreateJob)}
              >
                <JobBubbleIcon className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="create-job" />
                </span>
              </DropdownMenuItem>

              {auth?.shinkai_identity.includes('localhost') ? null : (
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.CreateInbox)}
                >
                  <ChatBubbleIcon className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="create-inbox" />
                  </span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => onClickMenuOption(MenuOption.NodeFiles)}
              >
                <FilesIcon className="mr-2 h-4 w-4" />
                <span>Node Files</span>
              </DropdownMenuItem>

              <DropdownMenuLabel>
                <FormattedMessage id="agent.other" />
              </DropdownMenuLabel>
              <DropdownMenuItem
                data-testid="nav-menu-agents-button"
                onClick={() => onClickMenuOption(MenuOption.Agents)}
              >
                <AgentIcon className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="agent.other" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="nav-menu-add-agent-button"
                onClick={() => onClickMenuOption(MenuOption.AddAgent)}
              >
                <AddAgentIcon className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="add-agent" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuLabel>
                <FormattedMessage id="account.one" />
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onClickMenuOption(MenuOption.Settings)}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="setting.other" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onClickMenuOption(MenuOption.Logout)}
              >
                <DisconnectIcon className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="disconnect" />
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {isJobInbox && <ArchiveJobButton />}
      </div>
    </nav>
  );
}
