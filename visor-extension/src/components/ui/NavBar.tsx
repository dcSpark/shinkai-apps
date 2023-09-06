import React, { useState, useRef } from 'react';
import { useOnClickOutside } from '../../hooks/hooks';
import './navbar.css';
import Sigil from './svg/Sigil';
import visorLogo from '../../icons/visor.svg';
import RocketIcon from '../../icons/rocket';
import SettingsIcon from '../../icons/settings';
import MenuIcon from '../../icons/menu-icon.svg';
import CloseIcon from '../../icons/close-icon.svg';
import BackIcon from '../../icons/back-icon.svg';
import AboutIcon from '../../icons/info';
import LauncherIcon from '../../icons/icon-launcher-menu';
import { useHistory, useLocation } from 'react-router-dom';
import { Messaging } from '../../messaging';
import { EncryptedShipCredentials } from '../../types';
interface NavbarProps {
  active: EncryptedShipCredentials;
  interacting: boolean;
}
export default function NavBar({ interacting, active }: NavbarProps) {
  const history = useHistory();
  const location = useLocation();
  const shinkailogo = useRef(null);
  const [modalOpen, toggleModal] = useState(false);
  const rootPage = ['/welcome', '/ship_list', '/settings/menu', '/about', '/ask_perms'].includes(
    location.pathname
  );
  const wrapperClass = active
    ? 'navbar-sigil-wrapper active-navbar-sigil'
    : 'navbar-sigil-wrapper inactive-navbar-sigil';
  const className = active ? 'navbar-sigil' : 'navbar-sigil blurry-sigil';
  const dummy = <div className="dummy-sigil"></div>;
  const sigil = (
    <div onClick={gotoSigil} className={className}>
      <Sigil size={50} patp={active?.shipName} />
    </div>
  );
  function openMenu() {
    if (!interacting) toggleModal(!modalOpen);
  }

  function goBack() {
    if (location.pathname.includes('/ship/')) history.push('/ship_list');
    else history.goBack();
  }

  function gotoSigil() {
    if (!interacting) {
      Messaging.sendToBackground({
        action: 'select_ship',
        data: { ship: active },
      }).then(res => history.push(`/ship/${active.shipName}`));
    }
  }
  const displaySigil = active ? sigil : dummy;

  return (
    <nav className="App-navbar">
      <div className="back-button-container">
        {!rootPage && (
          <div onClick={goBack} className="back-button">
            {' '}
            <img src={BackIcon} />{' '}
          </div>
        )}
      </div>
      <img src={visorLogo} className="Nav-logo" />
      <img
        ref={shinkailogo}
        onClick={openMenu}
        src={modalOpen ? CloseIcon : MenuIcon}
        alt="menu-icon"
        className="menu-icon"
      />
      {modalOpen && <Modal parent={shinkailogo} hide={() => toggleModal(!modalOpen)} />}
    </nav>
  );
}

interface ModalProps {
  parent: any;
  hide: () => void;
}

function Modal({ parent, hide }: ModalProps) {
  const history = useHistory();
  const ref = useRef(null);
  const refs = [ref, parent];
  const handleClickOutside = () => hide();
  function gotoShips() {
    hide();
    history.push('/ship_list');
  }
  function gotoSettings() {
    hide();
    history.push('/settings/menu');
  }
  function gotoLauncher() {
    hide();
    window.close();
    Messaging.relayToBackground({ app: 'command-launcher', action: 'open' }).then(res =>
      console.log(res)
    );
  }
  function gotoAbout() {
    hide();
    history.push('/about');
  }
  useOnClickOutside(refs, handleClickOutside);
  return (
    <div ref={ref} className="navbar-modal">
      <div onClick={gotoShips} className="modal-link">
        <RocketIcon />
        <p>My Ships</p>
      </div>
      <div onClick={gotoLauncher} className="modal-link">
        <LauncherIcon />
        <p>Launcher</p>
      </div>
      <div onClick={gotoSettings} className="modal-link">
        <SettingsIcon />
        <p> Settings</p>
      </div>
      <div onClick={gotoAbout} className="modal-link">
        <AboutIcon />
        <p>About</p>
      </div>
    </div>
  );
}
