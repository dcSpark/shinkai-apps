import { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { useSelectorSw } from '../../service-worker/service-worker-store';
import { WithNav } from '../../with-nav/with-nav';
import { AddNode } from '../add-node/add-node';
import { Inboxes } from '../inboxes/inboxes';
import { SplashScreen } from '../splash-screen/splash-screen';
import Welcome from '../welcome/welcome';

export const PopupRouting = () => {
  const history = useHistory();
  const status = useSelectorSw((state) => state?.node?.status);
  useEffect(() => {
    console.log('status', status);
    if (status === 'succeeded') {
      history.replace('/inboxes/all');
    } else if (status === 'idle') {
      history.replace('/welcome');
    }
  }, [status, history]);
  return (
    <div className="h-full flex flex-col p-5">
      <Switch>
        <Route exact path="/">
          <SplashScreen></SplashScreen>
        </Route>
        <Route path="/welcome">
          <Welcome />
        </Route>
        <WithNav>
          <Route path="/nodes">
            <Switch>
              <Route path="/nodes/add">
                <AddNode></AddNode>
              </Route>
            </Switch>
          </Route>
          <Route path="/inboxes">
            <Switch>
              <Route path="/inboxes/all">
                <Inboxes></Inboxes>
              </Route>
            </Switch>
          </Route>
        </WithNav>
      </Switch>
    </div>
  );
};
