import './nav.css';

import { ArrowLeft, Bot, Inbox, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useTypedDispatch } from '../../store';
import { disconnectNode } from '../../store/node/node-actions';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

enum MenuOption {
  Inbox = 'inbox',
  Agents = 'agents',
  Logout = 'logout',
}

export default function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const [isMenuOpened, setMenuOpened] = useState(false);
  const isRootPage = ['/welcome', '/inboxes', '/agents', '/jobs'].includes(
    location.pathname,
  );
  const dispatch = useTypedDispatch();

  function goBack() {
    history.goBack();
  }

  const logout = (): void => {
    dispatch(disconnectNode());
  };

  const onClickMenuOption = (key: MenuOption) => {
    switch (key) {
      case MenuOption.Inbox:
        history.replace('/inboxes');
        break;
      case MenuOption.Agents:
        history.replace('/agents');
        break;
      case MenuOption.Logout:
        logout();
        break;
      default:
        break;
    }
  };

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
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
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
              onClick={() => onClickMenuOption(MenuOption.Agents)}
            >
              <Bot className="mr-2 h-4 w-4" />
              <span>
                <FormattedMessage id="agent.other" />
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onClickMenuOption(MenuOption.Logout)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>
                <FormattedMessage id="logout" />
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
