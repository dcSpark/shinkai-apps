import * as React from 'react';
import { useState, useEffect } from 'react';
import Ship from './Ship';
import { EncryptedLLMCredentials, EncryptedShipCredentials } from '../../types';
import { useHistory } from 'react-router-dom';
import { Messaging } from '../../messaging';
import { motion } from 'framer-motion';
import './list.css';
import LLM from './LLM';

export default function ShipLLMsList() {
  useEffect(() => {
    let isMounted = true;
    Messaging.sendToBackground({ action: 'cache_form_url', data: { url: '' } });
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      console.log('get_ships: ', res);
      if (isMounted) {
        // testing something delete this
        const shipUpdated = res.ships.map((ship: EncryptedShipCredentials) => {
          return {
            encryptedShipCode: ship.encryptedShipCode,
            encryptedShipURL: ship.encryptedShipURL,
            shipName: ship.shipName != null ? ship.shipName : 'No Name',
          };
        });
        setActive(res.active);
        setShips(shipUpdated);
      }
    });
    Messaging.sendToBackground({ action: 'get_llms' }).then(res => {
      console.log('get_llms:', res);
      if (isMounted) {
        setLLMs(res.llms);
        setLLMActive(res.activeLLM);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const history = useHistory();
  const [ships, setShips] = useState([]);
  const [llms, setLLMs] = useState([]);
  const [active, setActive] = useState<EncryptedShipCredentials>(null);
  const [llmActive, setLLMActive] = useState<EncryptedLLMCredentials>(null);

  const inactive = ships.filter(s => s.shipName != active?.shipName);

  const llmsMessage = llmActive ? '' : 'No LLMs connected';
  let ordered = [];
  ordered = active ? [active, ...inactive] : inactive;
  const display = ordered.length ? (
    ordered.map(ship => {
      return <Ship active={active} key={ship.shipName} ship={ship} />;
    })
  ) : (
    <p>Please add a ship</p>
  );

  let llmOrdered = [];
  const llmInactive = llms.filter((s: EncryptedLLMCredentials) => s.llmName != llmActive?.llmName);
  llmOrdered = llmActive ? [llmActive, ...llmInactive] : llmInactive;
  console.log('> llmOrdered: ', llmOrdered);
  const llmsDisplay = llmOrdered.length ? (
    llmOrdered.map(llm => {
      console.log('> llm: ', llm);
      return <LLM active={llmActive} llm={llm} />;
    })
  ) : (
    <p>Please add an LLM</p>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dashboard flex-grow-wrapper"
    >
      <h1 className="title-page">Your LLMs</h1>
      <div className="llms-list flex-grow">{llmsDisplay}</div>
      <p className="llms-connected-msg"> {llmsMessage}</p>
      <h1 className="title-page">Your Ships</h1>
      <div className="ship-list flex-grow">{display}</div>
      <button className="linear-button" onClick={() => history.push('/add_llm')}>
        + Add LLM
      </button>
      <p></p>
      <div className="padding">
        <button className="linear-button" onClick={() => history.push('/add_ship')}>
          + Add Ship
        </button>
      </div>
    </motion.div>
  );
}
