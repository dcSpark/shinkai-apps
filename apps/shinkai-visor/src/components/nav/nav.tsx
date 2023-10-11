import './nav.css';

import { ArrowLeft, Bot, Inbox, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useAuth } from '../../store/auth/auth';
import { useUIContainer } from '../../store/ui-container/ui-container';
import { Button } from '../ui/button';
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
  Logout = 'logout',
}

export default function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const setLogout = useAuth((state) => state.setLogout);
  const uiContainer = useUIContainer((state) => state.uiContainer);

  const [isMenuOpened, setMenuOpened] = useState(false);
  const isRootPage = ['/welcome', '/inboxes', '/agents', '/jobs'].includes(
    location.pathname
  );

  function goBack() {
    history.goBack();
  }

  const logout = (): void => {
    setLogout();
  };

  const onClickMenuOption = (key: MenuOption) => {
    switch (key) {
      case MenuOption.Inbox:
        history.replace('/inboxes');
        break;
      case MenuOption.CreateInbox:
        history.replace('/inboxes/create-inbox');
        break;
      case MenuOption.CreateJob:
        history.replace('/inboxes/create-job');
        break;
      case MenuOption.Agents:
        history.replace('/agents');
        break;
      case MenuOption.AddAgent:
        history.replace('/agents/add');
        break;
      case MenuOption.Logout:
        logout();
        break;
      default:
        break;
    }
  };
  console.log('ELEMENT', uiContainer?.shadowRoot ? { container: uiContainer.rootElement }: {});
  return (
    <nav className="flex flex-col bg-gray-100 shadow-lg p-5 rounded-lg space-y-6">
      <div className="flex flex-row place-items-center justify-between">
        <div className="flex-none">
          {!isRootPage && (
            <Button onClick={() => goBack()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        <img
          alt="shinkai-app-logo"
          className="h-full"
          src={srcUrlResolver(visorLogo)}
        />
        <DropdownMenu
          onOpenChange={(value) => setMenuOpened(value)}
          open={isMenuOpened}
        >
          <DropdownMenuTrigger asChild>
            <Button>
              {!isMenuOpened ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal container={uiContainer?.rootElement}>
            <DropdownMenuContent className="w-56">
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
                <Inbox className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="create-inbox" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onClickMenuOption(MenuOption.CreateJob)}
              >
                <Inbox className="mr-2 h-4 w-4" />
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
                onClick={() => onClickMenuOption(MenuOption.Logout)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>
                  <FormattedMessage id="logout" />
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>
    </nav>
  );
}
