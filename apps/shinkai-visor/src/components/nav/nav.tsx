import './nav.css';

import { ArrowLeft, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { NavMenu } from '../nav-menu/nav-menu';
import { Button } from '../ui/button';

export default function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const [isMenuOpened, setMenuOpened] = useState(false);
  const isRootPage = ['/welcome', '/inboxes', '/agents', '/jobs'].includes(
    location.pathname,
  );

  function goBack() {
    history.goBack();
  }

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
        <Button
          className="flex-none"
          onClick={() => setMenuOpened(!isMenuOpened)}
        >
          {!isMenuOpened ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isMenuOpened && <NavMenu />}
    </nav>
  );
}
