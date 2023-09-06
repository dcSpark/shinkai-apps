import React, { useState, useEffect } from 'react';
import Sigil from '../ui/svg/Sigil';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../messaging';
import { decrypt } from '../../storage';
import { EncryptedShipCredentials } from '../../types';
import { motion } from 'framer-motion';

interface ConfirmRemoveProps {
  ship: EncryptedShipCredentials;
}

export default function ConfirmRemove({ ship }: ConfirmRemoveProps) {
  const history = useHistory();
  const [error, setError] = useState('');
  const [pw, setPw] = useState('');
  function remove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const url = decrypt(ship.encryptedShipURL, pw);
    if (url.length) {
      Messaging.sendToBackground({
        action: 'remove_ship',
        data: { ship: ship },
      }).then(res => {
        history.push('/ship_list');
      });
    } else {
      setError('Wrong Password');
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ship-removal-confirmation"
    >
      <div>
        <h3 className="title-page centered">Confirm removal</h3>
        <div className="sigil-wrap">
          <Sigil size={180} patp={ship.shipName} />
        </div>
        <div className="text">
          <p className="ship-to-delete">~{ship.shipName}</p>
          {/* <p>The above ship will be removed from Shinkai Visor.</p> */}
        </div>
      </div>
      <form className="" onSubmit={remove}>
        <label className="label-input">
          Input Master Password
          <input
            onChange={e => setPw(e.currentTarget.value)}
            type="password"
            placeholder="Master Password"
          />
        </label>
        <p className="errorMessage">{error}</p>
        <div className="two-buttons">
          <button
            className="linear-red-bg left"
            type="button"
            onClick={() => history.push('/settings/remove_ships')}
          >
            Cancel
          </button>
          <button className="single-button right" type="submit">
            Remove
          </button>
        </div>
      </form>
    </motion.div>
  );
}
