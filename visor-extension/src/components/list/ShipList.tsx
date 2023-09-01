import * as React from 'react';
import { useState, useEffect } from 'react';
import Ship from './Ship';
import { EncryptedShipCredentials } from '../../types';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../messaging';
import { motion } from 'framer-motion';
import './list.css';

export default function ShipList() {
  useEffect(() => {
    let isMounted = true;
    Messaging.sendToBackground({ action: 'cache_form_url', data: { url: '' } });
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      if (isMounted) {
        setShips(res.ships);
        setActive(res.active);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);
  const history = useHistory();
  const [ships, setShips] = useState([]);
  const [active, setActive] = useState<EncryptedShipCredentials>(null);

  const inactive = ships.filter(s => s.shipName != active?.shipName);

  const message = active ? '' : 'No ship connected';
  let ordered = [];
  ordered = active ? [active, ...inactive] : inactive;
  const display = ordered.length ? (
    ordered.map(ship => {
      return <Ship active={active} key={ship.shipName} ship={ship} />;
    })
  ) : (
    <p>Please add a ship</p>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard flex-grow-wrapper"
    >
      <h1 className="title-page">Your Ships</h1>
      <div className="ship-list flex-grow">{display}</div>
      <p className="ships-connected-msg"> {message}</p>
      <div className="padding">
        <button className="linear-button" onClick={() => history.push('/add_ship')}>
          + Add Ship
        </button>
      </div>
    </motion.div>
  );
}
