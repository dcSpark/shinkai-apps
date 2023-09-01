import * as React from 'react';
import { useState, useEffect } from 'react';
import NavBar from './components/ui/NavBar';
import Welcome from './components/setup/Welcome';
import Setup from './components/setup/Setup';
import AddShip from './components/adding/AddShip';
import ShipList from './components/list/ShipList';
import ShipShow from './components/show/ShipShow';
import PermissionsPrompt from './components/perms/PermissionsPrompt';
import Settings from './components/settings/Settings';
import About from './components/ui/About';
import { AnimatePresence } from 'framer-motion';
import { EncryptedShipCredentials } from './types';
import { Messaging } from './messaging';
import { MemoryRouter as Router, Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { LocationDescriptor } from 'history';

import './App.css';

export default function App() {
  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_initial_state' }).then(state => {
      setFirst(state.first);
      setShips(state.ships);
      setActive(state.activeShip);
      setPermsRequest(state.requestedPerms);
      setInteracting(state.requestedPerms != undefined || state.first);
      route(state);
    });
  }, []);
  const [active, setActive] = useState<EncryptedShipCredentials>(null);
  const [interacting, setInteracting] = useState(false);
  const [ships, setShips] = useState([]);
  const [first, setFirst] = useState(false);
  const [permsRequest, setPermsRequest] = useState(null);

  const history = useHistory();

  function route(state: any): void {
    console.log(state, 'state to route from');
    if (state.first) history.push('/welcome');
    else if (state.cachedURL?.length || state.cachedCreds) history.push('/add_ship');
    else if (state.requestedPerms) history.push('/ask_perms');
    else if (state.activeShip) {
      Messaging.sendToBackground({ action: 'select_ship', data: { ship: state.activeShip } }).then(
        res => history.push(`/ship/${state.activeShip.shipName}`)
      );
    } else if (state.ships.length) history.push('/ship_list');
    else history.push('/add_ship');
  }

  function redirect(): LocationDescriptor {
    if (first) return '/welcome';
    else if (active) return '/ship';
    else if (ships.length) return '/ship_list';
    else return '/add_ship';
  }

  return (
    <div className="App">
      <NavBar active={active} interacting={interacting} />
      <div className="App-content">
        <AnimatePresence>
          <Switch>
            <Route exact path="/">
              <Redirect to={redirect()} />
            </Route>
            <Route path="/welcome">
              <Welcome />
            </Route>
            <Route path="/setup">
              <Setup setInteracting={setInteracting} />
            </Route>
            <Route path="/add_ship">
              <AddShip />
            </Route>
            <Route path="/ship_list">
              <ShipList />
            </Route>
            <Route key={Date.now()} path="/ship/:patp">
              <ShipShow />
            </Route>
            <Route path="/ask_perms">
              <PermissionsPrompt perms={permsRequest} />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/about">
              <About />
            </Route>
          </Switch>
        </AnimatePresence>
      </div>
    </div>
  );
}
