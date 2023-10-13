import { ApiConfig } from '@shinkai_network/shinkai-message-ts/api/api_config';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { useGlobalPopupChromeMessage } from '../../hooks/use-global-popup-chrome-message';
import { useAuth } from '../../store/auth/auth';
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

export const PopupRouting = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const location = useLocation();
  const [popupVisibility] = useGlobalPopupChromeMessage();
  useEffect(() => {
    const isAuthenticated = !!auth;
    if (isAuthenticated) {
      ApiConfig.getInstance().setEndpoint(auth.node_address);
      history.replace('/inboxes');
      return;
    } else {
      history.replace('/welcome');
    }
  }, [history, auth]);
  return (
    <AnimatePresence>
      {popupVisibility && (
        <motion.div
          animate={{ opacity: 1 }}
          className={`h-full w-full flex flex-col p-4 border-solid border-primary border-2 rounded-lg bg-background`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
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
                  <Route path="/inboxes/create-inbox">
                    <CreateInbox></CreateInbox>
                  </Route>
                  <Route path="/inboxes/create-job">
                    <CreateJob></CreateJob>
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
            </WithNav>
            <Route path="*">
              <NotFound></NotFound>
            </Route>
          </Switch>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
