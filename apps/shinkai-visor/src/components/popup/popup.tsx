import { ApiConfig } from '@shinkai_network/shinkai-message-ts/api/api_config';
import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { MemoryRouter as Router } from 'react-router-dom';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';

import { useGlobalPopupChromeMessage } from '../../hooks/use-global-popup-chrome-message';
import { langMessages, locale } from '../../lang/intl';
import { useAuth } from '../../store/auth/auth';
import { useUIContainer } from '../../store/ui-container/ui-container';
import globalStyle from '../../theme/styles.css?inline';
import { AddAgent } from '../add-agent/add-agent';
import { AddNode } from '../add-node/add-node';
import { Agents } from '../agents/agents';
import { AnimatedRoute } from '../animated-route/animated-routed';
import { CreateInbox } from '../create-inbox/create-inbox';
import { CreateJob } from '../create-job/create-job';
import { Inbox } from '../inbox/inbox';
import { Inboxes } from '../inboxes/inboxes';
import { SplashScreen } from '../splash-screen/splash-screen';
import Welcome from '../welcome/welcome';
import { WithNav } from '../with-nav/with-nav';

export const Popup = ({
  container,
}: {
  container: { shadowRoot: ShadowRoot; rootElement: HTMLElement };
}) => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const location = useLocation();
  const [popupVisibility] = useGlobalPopupChromeMessage();
  const setUIContainer = useUIContainer((state) => state.setUIContainer);
  setUIContainer({
    shadowRoot: container.shadowRoot,
    rootElement: container.rootElement,
  });
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
          className="h-full w-full flex flex-col p-4 shadow-xl rounded-lg bg-secondary-600 bg-app-gradient"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Switch key={location.pathname} location={location}>
            <Route exact path="/">
              <AnimatedRoute>
                <SplashScreen></SplashScreen>
              </AnimatedRoute>
            </Route>
            <Route path="/welcome">
              <AnimatedRoute>
                <Welcome />
              </AnimatedRoute>
            </Route>
            <Route path="/nodes">
              <AnimatedRoute>
                <Switch>
                  <Route path="/nodes/add">
                    <AddNode></AddNode>
                  </Route>
                </Switch>
              </AnimatedRoute>
            </Route>
            <Route path="*">
              <AnimatedRoute>
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
              </AnimatedRoute>
            </Route>
          </Switch>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const baseContainer = document.createElement('shinkai-popup-root');
const shadowRoot = baseContainer.attachShadow({ mode: 'closed' });
const container = document.createElement('div');
container.id = 'root';
shadowRoot.appendChild(container);
const htmlRoot = document.getElementsByTagName('html')[0];
htmlRoot.prepend(baseContainer);
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <style>{globalStyle}</style>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={langMessages}>
        <div className="fixed font-inter w-[357px] h-[600px] top-32 right-16 overflow-hidden z-[1500000000]">
          <Router>
            <Popup
              container={{ shadowRoot: shadowRoot, rootElement: container }}
            ></Popup>
          </Router>
        </div>
      </IntlProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
