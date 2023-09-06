import * as React from 'react';
import { useState, useEffect } from 'react';
import NavBar from './components/ui/NavBar';
import Welcome from './components/setup/Welcome';
import Setup from './components/setup/Setup';
import AddShip from './components/adding/AddShip';
import AddLLM from './components/adding/AddLLM';
import ShipLLMsList from './components/list/ShipLLMsList';
import ShipShow from './components/show/ShipShow';
import PermissionsPrompt from './components/perms/PermissionsPrompt';
import Settings from './components/settings/Settings';
import About from './components/ui/About';
import { AnimatePresence } from 'framer-motion';
import { EncryptedLLMCredentials, EncryptedShipCredentials } from './types';
import { Messaging } from './messaging';
import { MemoryRouter as Router, Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { LocationDescriptor } from 'history';

import './App.css';
import LLMShow from './components/show/LLMShow';

export default function App() {
  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_initial_state' }).then(state => {
      console.log('initial state: ', state);
      setFirst(state.first);
      setShips(state.ships);
      setLLMs(state.llms);
      setActiveLLM(state.activeLLM);
      setActive(state.activeShip);
      setPermsRequest(state.requestedPerms);
      setInteracting(state.requestedPerms != undefined || state.first);
      route(state);
    });
  }, []);
  const [active, setActive] = useState<EncryptedShipCredentials>(null);
  const [activeLLM, setActiveLLM] = useState<EncryptedLLMCredentials>(null);
  const [interacting, setInteracting] = useState(false);
  const [ships, setShips] = useState([]);
  const [llms, setLLMs] = useState([]);
  const [first, setFirst] = useState(false);
  const [permsRequest, setPermsRequest] = useState(null);

  const history = useHistory();

  function route(state: any): void {
    console.log('state to route from: ', state);
    console.log('state.cachedURL?.length: ', state.cachedURL?.length);
    console.log('state.cachedCreds: ', state.cachedCreds);
    if (state.first) history.push('/welcome');
    else if (state.cachedURL?.length || state.cachedCreds) history.push('/add_llm'); // TODO: not sure if this is right
    else if (state.requestedPerms) history.push('/ask_perms');
    else if (state.activeLLM) {
      Messaging.sendToBackground({ action: 'select_llm', data: { llm: state.activeLLM } }).then(
        res => history.push(`/llm/${state.activeLLM.uniqueId}`)
      );
    } else if (state.llms.length) history.push('/ship_list');
    else {
      console.log('pushing to add_llm');
      console.log('state.activeLLM: ', state.activeLLM);
      history.push('/add_llm');
    }
  }

  function redirect(): LocationDescriptor {
    if (first) return '/welcome';
    else if (activeLLM) return '/llm/' + activeLLM.uniqueId;
    else if (llms.length) return '/ship_list';
    else return '/add_llm';
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
            <Route path="/add_llm">
              <AddLLM />
            </Route>
            <Route path="/ship_list">
              <ShipLLMsList />
            </Route>
            <Route key={Date.now()} path="/ship/:patp">
              <ShipShow />
            </Route>
            <Route key={Date.now()} path="/llm/:uniqueId">
              <LLMShow />
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
