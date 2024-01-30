import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
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
  Button,
  DisconnectIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  InboxIcon,
  JobBubbleIcon,
} from '@shinkai_network/shinkai-ui';
import { ArrowLeft, Menu, Settings, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory, useLocation } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useAuth } from '../../store/auth/auth';
import { EditInboxNameDialog } from '../edit-inbox-name-dialog/edit-inbox-name-dialog';

enum MenuOption {
  Inbox = 'inbox',
  CreateInbox = 'create-inbox',
  Agents = 'agents',
  AddAgent = 'add-agent',
  CreateJob = 'create-job',
  Settings = 'settings',
  Logout = 'logout',
}

const DisplayInboxName = () => {
  const auth = useAuth((state) => state.auth);
  const location = useLocation();

  const { inboxes } = useGetInboxes({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: auth?.profile ?? '',
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: auth?.shinkai_identity ?? '',
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const [isEditInboxNameDialogOpened, setIsEditInboxNameDialogOpened] =
    useState<boolean>(false);

  const currentInbox = useMemo(() => {
    const inboxId = location.pathname.split('/')?.[2];
    const decodedInboxId = decodeURIComponent(inboxId);
    const currentInbox = inboxes.find(
      (inbox) => decodedInboxId === inbox.inbox_id,
    );
    return currentInbox;
  }, [inboxes, location.pathname]);
  return (
    <>
      <Button
        className="relative inline-flex h-auto max-w-[250px] bg-transparent px-2.5 py-1.5"
        variant="ghost"
      >
        <span
          className="line-clamp-1 text-base font-medium text-white"
          onClick={() => setIsEditInboxNameDialogOpened(true)}
        >
          {currentInbox?.custom_name || currentInbox?.inbox_id}
        </span>
      </Button>
      <EditInboxNameDialog
        inboxId={currentInbox?.inbox_id || ''}
        name={currentInbox?.custom_name || ''}
        onCancel={() => setIsEditInboxNameDialogOpened(false)}
        onSaved={() => setIsEditInboxNameDialogOpened(false)}
        open={isEditInboxNameDialogOpened}
      />
    </>
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
  ].includes(location.pathname);

  const isInboxPage = location.pathname.includes('/inboxes/job_inbox');
  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);

  const goBack = () => {
    history.goBack();
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
      <div className="flex items-center justify-between">
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

              {/* Temporarily disabled while shinkai-node implements networking layer */}
              {/* <DropdownMenuItem
                onClick={() => onClickMenuOption(MenuOption.CreateInbox)}
              >
                <ChatBubbleIcon className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="create-inbox" />
                </span>
              </DropdownMenuItem> */}

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
      </div>
    </nav>
  );
}
