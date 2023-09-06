import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import Sigil from '../../components/ui/svg/Sigil';
import { validate } from '../../storage';
import { Messaging } from '../../messaging';
import { EncryptedShipCredentials } from '../../types';
import ConfirmRemove from './ConfirmRemove';
import { whatShip, processName } from '../../utils';
import { motion } from 'framer-motion';
import './settings.css';
import { Route, Link, useHistory } from 'react-router-dom';
import arrowRightIcon from '../../icons/arrow-right-icon.svg';
import deleteIcon from '../../icons/delete-icon.svg';
import alertIcon from '../../icons/alert-icon.svg';

export default function Settings() {
  useEffect(() => {
    Messaging.sendToBackground({ action: 'cache_form_url', data: { url: '' } });
  }, []);

  const [shipToRemove, setShip] = useState<EncryptedShipCredentials>(null);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="settings flex-grow-wrapper justify-start"
    >
      <Route path="/settings/menu">
        <Link to="/settings/menu">
          <h1 className="title-page">Settings</h1>
        </Link>
        <SettingsMenu />
      </Route>
      <Route path="/settings/popup">
        <SettingsPopup />
      </Route>
      <Route path="/settings/remove_ships">
        <SettingsRemoveShips setShip={setShip} />
      </Route>
      <Route path="/settings/change_password">
        <SettingsChangePw />
      </Route>
      <Route path="/settings/reset_app">
        <SettingsReset />
      </Route>
      <Route path="/settings/confirm_remove">
        <ConfirmRemove ship={shipToRemove} />
      </Route>
    </motion.div>
  );
}

function SettingsMenu() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="settings-option">
        <Link to="/settings/popup">
          <div className="settings-option-text">
            <h3>Permission Confirmation Settings</h3>
            <p>Select whether Shinkai Visor should use new window popups</p>
          </div>
          <img src={arrowRightIcon} className="settings-option-icon" />
        </Link>
      </div>
      <div className="settings-option">
        <Link to="/settings/remove_ships">
          <div className="settings-option-text">
            <h3>Remove Ships</h3>
            <p>Remove saved ships from your Shinkai Visor extension</p>
          </div>
          <img src={arrowRightIcon} className="settings-option-icon" />
        </Link>
      </div>
      <div className="settings-option">
        <Link to="/settings/change_password">
          <div className="settings-option-text">
            <h3>Change Master Password</h3>
            <p>Update your master password which secures Shinkai Visor</p>
          </div>
          <img src={arrowRightIcon} className="settings-option-icon" />
        </Link>
      </div>
      <div className="settings-option">
        <Link to="/settings/reset_app">
          <div className="settings-option-text">
            <h3>Reset Shinkai Visor</h3>
            <p>Reset all of your settings and start fresh</p>
          </div>
          <img src={arrowRightIcon} className="settings-option-icon" />
        </Link>
      </div>
    </motion.div>
  );
}

function SettingsPopup() {
  const [error, setError] = useState('');
  const [setting, setSetting] = useState(null);
  const [buttonString, setButton] = useState('Save');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_settings' }).then(res => {
      setSetting(res.popupPreference);
    });
  }, []);

  function handleChange(e: React.FormEvent<HTMLInputElement>) {}

  function handleClick(e: React.FormEvent<HTMLInputElement>) {
    const value = setting === 'modal' ? 'window' : 'modal';
    setSetting(value);
    setButton('Save');
    setDisabled(false);
  }
  function saveSetting() {
    Messaging.sendToBackground({
      action: 'change_popup_preference',
      data: { preference: setting },
    }).then(res => {
      if (res) {
        setButton('Saved');
        setDisabled(true);
      } else {
        setError('Error');
      }
    });
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="permission-container"
    >
      <div>
        <h3 className="title-page">Permission Confirmation</h3>
        <p className="description">
          Choose whether Shinkai Visor will create a new page popup when permissions are requested.
        </p>
      </div>
      <div className="popup-settings flex-grow">
        <div className="option">
          <p> Show Modal in Page</p>
          <input
            className="toggle"
            name="popup"
            type="radio"
            id="modal"
            value="modal"
            checked={setting == 'modal'}
            onChange={handleChange}
            onClick={handleClick}
          />
        </div>
        <div className="option">
          <p> Open Popup Window</p>
          <input
            className="toggle"
            name="popup"
            type="radio"
            id="window"
            value="window"
            checked={setting == 'window'}
            onChange={handleChange}
            onClick={handleClick}
          />
        </div>
        <p className="errorMessage">{error}</p>
      </div>
      <button className="single-button" disabled={disabled} onClick={saveSetting}>
        {buttonString}
      </button>
    </motion.div>
  );
}

interface RemoveShipsProps {
  setShip: (ship: EncryptedShipCredentials) => void;
}
function SettingsRemoveShips({ setShip }: RemoveShipsProps) {
  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_ships' }).then(response => setShips(response.ships));
  }, []);
  const [ships, setShips] = useState([]);
  const history = useHistory();
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  function confirm(ship: EncryptedShipCredentials) {
    setShip(ship);
    history.push('/settings/confirm_remove');
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="remove-ships-list"
    >
      <h3 className="title-page">Remove Ships</h3>
      {ships.map(ship => (
        <ShipToRemove key={ship.shipName} confirm={confirm} ship={ship} />
      ))}
    </motion.div>
  );
}
interface ShipToRemoveProps {
  ship: EncryptedShipCredentials;
  confirm: (ship: EncryptedShipCredentials) => void;
}
function ShipToRemove({ ship, confirm }: ShipToRemoveProps) {
  const displayName = processName(ship.shipName);

  const shipname =
    whatShip(ship.shipName) === 'moon' ? (
      <p className="moonname shipname">
        <span>~{displayName.slice(0, -14)}</span>
        <span>{displayName.slice(-14)}</span>
      </p>
    ) : (
      <p className="shipname">~{displayName}</p>
    );

  return (
    <div key={ship.shipName} className="ship-to-remove">
      <div className="flex">
        <div className="mini-sigil-wrapper">
          <Sigil patp={ship.shipName} size={48} />
        </div>
        {shipname}
      </div>
      <button className="minibutton" onClick={() => confirm(ship)}>
        <img src={deleteIcon} alt="trash" />
      </button>
    </div>
  );
}

function SettingsChangePw() {
  const history = useHistory();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [oldPassword, setOldpw] = useState('');
  const [pw, setPw] = useState('');
  const [confirmationpw, setConfirmation] = useState('');

  const displayMessage =
    error.length > 0 ? (
      <p className="errorMessage">{error}</p>
    ) : (
      <p className="successMessage">{message}</p>
    );

  async function checkOld(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const res = await validate(oldPassword);
    if (res) proceed();
    else setError('Wrong Old Password');
  }

  function proceed() {
    if (pw === confirmationpw) {
      Messaging.sendToBackground({
        action: 'change_master_password',
        data: { oldPw: oldPassword, newPw: pw },
      }).then(res => {
        setMessage('');
        history.push('/ship_list');
      });
    } else {
      setError('Passwords do not match');
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="full-size change-password-container"
    >
      <h3 className="title-page">Change Master Password</h3>
      <form onSubmit={checkOld} className="">
        <div className="form-password-container">
          <label className="label-input">Old Password</label>
          <input onChange={e => setOldpw(e.currentTarget.value)} type="password" />
          <label className="label-input">New Password</label>
          <input onChange={e => setPw(e.currentTarget.value)} type="password" />
          <label className="label-input">Confirm New Password</label>
          <input onChange={e => setConfirmation(e.currentTarget.value)} type="password" />
          {displayMessage}
        </div>
        <button className="single-button" type="submit">
          Submit
        </button>
      </form>
    </motion.div>
  );
}

function SettingsReset() {
  const history = useHistory();
  const resetApp = useStore(state => state.resetApp);
  async function doReset() {
    Messaging.sendToBackground({ action: 'reset_app' }).then((res: any) =>
      history.push('/welcome')
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="reset-app-container"
    >
      <div>
        <h3 className="title-page">Reset Shinkai Visor</h3>
        <p className="description">
          Click on the button below to reset the extension to factory settings.
        </p>
      </div>
      <div>
        <div className="alert-container vertical">
          <img src={alertIcon} alt="alert" />
          <h5>Important information</h5>
          <p>This will remove all of your data from Shinkai Visor.</p>
        </div>
        <button className="single-button red-bg" onClick={doReset}>
          Reset
        </button>
      </div>
    </motion.div>
  );
}
