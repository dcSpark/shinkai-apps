import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useClickAway } from "@uidotdev/usehooks";
import visorLogo from '../../assets/icons/visor.svg';
import MenuIcon from '../../assets/icons/menu-icon.svg';
import CloseIcon from '../../assets/icons/close-icon.svg';
import BackIcon from '../../assets/icons/back-icon.svg';
import { NavMenu } from '../nav-menu/nav-menu';

import './nav.css';

export default function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const [isMenuOpened, setMenuOpened] = useState(false);
  const isRootPage = [
    '/welcome',
  ].includes(location.pathname);
  console.log(location.pathname)
  const ref = useClickAway<HTMLElement>(() => {
    setMenuOpened(false);
  });

  function goBack() {
    history.goBack();
  }

  return (
    <nav ref={ref} className={`flex flex-col bg-gray-100 shadow-lg p-5 rounded-lg space-y-6`}>
      <div className="flex flex-row justify-between place-items-center">
        {!isRootPage && (
          <div
            onClick={() => goBack()}
            className="h-full grid place-content-center"
          >
            <img alt="back-icon" src={BackIcon} />
          </div>
        )}
        <img src={visorLogo} alt="shinkai-app-logo" className="grow-0" />
        <img
          onClick={() => setMenuOpened(!isMenuOpened)}
          src={isMenuOpened ? CloseIcon : MenuIcon}
          alt="menu-icon"
          className="h-6 w-6 grow-0"
        />
      </div>
      {isMenuOpened && <NavMenu />}
    </nav>
  );
}
