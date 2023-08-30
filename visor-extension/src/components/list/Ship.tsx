import * as React from 'react';
import Sigil from '../ui/svg/Sigil';
import { EncryptedShipCredentials } from '../../types';
import { Messaging } from '../../messaging';
import { whatShip, getIcon, processName } from '../../utils';
import { useHistory } from 'react-router-dom';
import './list.css';

interface ShipProps {
  active: EncryptedShipCredentials;
  ship: EncryptedShipCredentials;
}
export default function Ship(props: ShipProps) {
  const history = useHistory();
  const displayName = processName(props.ship.shipName);
  const shipname =
    whatShip(props.ship.shipName) === 'moon' ? (
      <div onClick={select} className="moonname shipname">
        <p>
          ~{displayName.slice(0, -14)}
          {displayName.slice(-14)}
        </p>
        {/* <p>~{displayName.slice(0, -14)}</p>
        <p>{displayName.slice(-14)}</p> */}
      </div>
    ) : (
      <p onClick={select} className="shipname">
        ~{displayName}
      </p>
    );

  function select(): void {
    Messaging.sendToBackground({
      action: 'select_ship',
      data: { ship: props.ship },
    }).then(res => history.push(`/ship/${props.ship.shipName}`));
  }

  return (
    <div
      onClick={select}
      className={props.active?.shipName == props.ship.shipName ? ' ship active-ship' : 'ship'}
    >
      <div
        className={
          props.active?.shipName == props.ship.shipName ? 'active-label' : 'inactive-label'
        }
      >
        Connected
      </div>
      <div className="sigil-wrapper">
        <Sigil
          size={props.active?.shipName == props.ship.shipName ? 40 : 40}
          patp={props.ship.shipName}
        />
      </div>
      <div className="vertical name-container">
        {shipname}
        <div className="type-label">
          <img src={getIcon(props.ship.shipName)} className="type-icon" />
          <p>{whatShip(props.ship.shipName)}</p>
        </div>
      </div>
    </div>
  );
}
