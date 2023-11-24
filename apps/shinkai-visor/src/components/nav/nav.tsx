import { Button } from '@shinkai_network/shinkai-ui';
import {
  ArrowLeft,
  Bot,
  Inbox,
  Menu,
  MessageCircle,
  Settings,
  Unplug,
  Workflow,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useAuth } from '../../store/auth/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

enum MenuOption {
  Inbox = 'inbox',
  CreateInbox = 'create-inbox',
  Agents = 'agents',
  AddAgent = 'add-agent',
  CreateJob = 'create-job',
  Settings = 'settings',
  Logout = 'logout',
}

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
  const [isConfirmLogoutDialogOpened, setIsConfirmLogoutDialogOpened] =
    useState(false);

  const goBack = () => {
    history.goBack();
  };
  const logout = (): void => {
    setAuth(null);
  };

  const onClickMenuOption = (key: MenuOption) => {
    console.log('menu option', key, MenuOption.Settings);
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
  const exportConnection = () => {
    history.push('settings/export-connection');
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
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs italic">
                    <FormattedMessage id="permanently-lose-connection" />
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className="cursor-pointer underline decoration-dashed"
                    onClick={() => exportConnection()}
                  >
                    Export your conection
                  </span>
                  <span className="text-xs">If you want to use it later</span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsConfirmLogoutDialogOpened(false)}
            >
              <FormattedMessage id="cancel" />
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => logout()}>
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
        <img
          alt="shinkai-app-logo"
          className="absolute left-0 right-0 ml-auto mr-auto w-[100px]"
          src={srcUrlResolver(visorLogo)}
        />
        {auth && (
          <DropdownMenu
            modal={false}
            onOpenChange={(value) => setMenuOpened(value)} open={isMenuOpened}
          >
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                {!isMenuOpened ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <FormattedMessage id="inbox.other"></FormattedMessage>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.Inbox)}
                >
                  <Inbox className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="inbox.other" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.CreateInbox)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="create-inbox" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.CreateJob)}
                >
                  <Workflow className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="create-job" />
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  <FormattedMessage id="agent.other"></FormattedMessage>
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.Agents)}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="agent.other" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onClickMenuOption(MenuOption.AddAgent)}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="add-agent" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  <FormattedMessage id="account.one"></FormattedMessage>
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
                  <Unplug className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="disconnect" />
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
