import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { useGlobalPopupChromeMessage } from '../../hooks/use-global-popup-chrome-message';
import { RootState } from '../../store';
import { AddAgent } from '../add-agent/add-agent';
import { AddNode } from '../add-node/add-node';
import { Agents } from '../agents/agents';
import { CreateInbox } from '../create-inbox/create-inbox';
import { CreateJob } from '../create-job/create-job';
import { Inbox } from '../inbox/inbox';
import { Inboxes } from '../inboxes/inboxes';
import { NotFound } from '../not-found/not-found';
import { SplashScreen } from '../splash-screen/splash-screen';
import Welcome from '../welcome/welcome';
import { WithNav } from '../with-nav/with-nav';
import stylito from './popup-routing.css?inline';
export const PopupRouting = () => {
  const history = useHistory();
  const authStatus = useSelector((state: RootState) => state?.auth?.status);
  const location = useLocation();
  const [popupVisibility] = useGlobalPopupChromeMessage();
  useEffect(() => {
    if (authStatus === 'authenticated') {
      history.replace('/inboxes');
      return;
    } else if (authStatus === 'unauthenticated') {
      history.replace('/welcome');
    }
  }, [authStatus, history]);
  return (
    <div className={`h-full w-full flex flex-col p-4 ${popupVisibility ? '' : 'hidden'} popup-container`}>
          <style>{stylito}</style>

      <Switch key={location.pathname} location={location}>
        <Route exact path="/">
          <SplashScreen></SplashScreen>
        </Route>
        <Route path="/welcome">
          <Welcome />
        </Route>
        <Route path="/nodes">
          <Switch>
            <Route path="/nodes/add">
              <AddNode></AddNode>
            </Route>
          </Switch>
        </Route>
        <WithNav>
          <Route path="/inboxes">
            <Switch>
              <Route path="/inboxes/create">
                <CreateInbox></CreateInbox>
              </Route>
              <Route path="/inboxes/:inboxId">
                <Inbox></Inbox>
              </Route>
              <Route path="/">
                <Inboxes></Inboxes>
              </Route>
            </Switch>
          </Route>

          <Route path="/agents">
            <Switch>
              <Route path="/agents/add">
                <AddAgent></AddAgent>
              </Route>
              <Route path="/">
                <Agents></Agents>
              </Route>
            </Switch>
          </Route>

          <Route path="/jobs">
            <Switch>
              <Route path="/jobs/create">
                <CreateJob></CreateJob>
              </Route>
            </Switch>
          </Route>
        </WithNav>
        <Route path="*">
          <NotFound></NotFound>
        </Route>
      </Switch>
    </div>
  );
};
