import '../../theme/styles.css';

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
import { useOnboarding } from '../../store/onboarding/onboarding';
import { AddAgent } from '../add-agent/add-agent';
import { Agents } from '../agents/agents';
import { AnimatedRoute } from '../animated-route/animated-routed';
import { ConnectMethodQrCode } from '../connect-method-qr-code/connec-method-qr-code';
import { ConnectMethodQuickStart } from '../connect-method-quick-start/connect-method-quick-start';
import { ConnectMethodRestoreConnection } from '../connect-method-restore-connection/connect-method-restore-connection';
import { CreateInbox } from '../create-inbox/create-inbox';
import { CreateJob } from '../create-job/create-job';
import { CreateRegistrationCode } from '../create-registration-code/create-registration-code';
import CredentialsEncryption from '../credentials-encryption/credentials-encryption';
import { ExportConnection } from '../export-connection/export-connection';
import { Inbox } from '../inbox/inbox';
import { Inboxes } from '../inboxes/inboxes';
import { Settings } from '../settings/settings';
import { SplashScreen } from '../splash-screen/splash-screen';
import Welcome from '../welcome/welcome';
import { WithNav } from '../with-nav/with-nav';

const useRedirectBasedOnOnboardingStatus = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const isAuthenticated = !!auth;
  const termsAcceptance = useOnboarding((state) => state.termsAcceptance);
  const hasCredentialsEncrypted = useOnboarding(
    (state) => state.hasCredentialsEncrypted,
  );
  console.log({
    termsAcceptance,
    hasCredentialsEncrypted,
    isAuthenticated,
  });
  useEffect(() => {
    if (termsAcceptance === undefined) {
      history.push('/onboarding/terms');
    } else if (hasCredentialsEncrypted === undefined) {
      history.push('/onboarding/encryption');
    } else if (isAuthenticated) {
      history.push('/inboxes');
    } else {
      history.push('/nodes/connect/method/quick-start');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, history]);
};
export const Popup = () => {
  const location = useLocation();
  const [popupVisibility] = useGlobalPopupChromeMessage();
  useRedirectBasedOnOnboardingStatus();

  useEffect(() => {
    console.log('location', location.pathname);
  }, [location]);
  return (
    <AnimatePresence>
      {popupVisibility && (
        <motion.div
          animate={{ opacity: 1 }}
          className="flex h-full w-full flex-col rounded-lg bg-gray-500 px-6 pb-6 pt-8 shadow-xl"
          data-testid="popup"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Switch key={location.pathname} location={location}>
            <Route exact path="/">
              <AnimatedRoute>
                <SplashScreen />
              </AnimatedRoute>
            </Route>

            <Route path="/onboarding">
              <AnimatedRoute>
                <Switch>
                  <Route path="/onboarding/terms">
                    <AnimatedRoute>
                      <Welcome />
                    </AnimatedRoute>
                  </Route>
                  <Route path="/onboarding/encryption">
                    <AnimatedRoute>
                      <CredentialsEncryption />
                    </AnimatedRoute>
                  </Route>
                </Switch>
              </AnimatedRoute>
            </Route>

            <Route path="*">
              <AnimatedRoute>
                <WithNav>
                  <Route path="/nodes">
                    <AnimatedRoute>
                      <Switch>
                        <Route path="/nodes/connect/method/quick-start">
                          <ConnectMethodQuickStart />
                        </Route>
                        <Route path="/nodes/connect/method/restore-connection">
                          <ConnectMethodRestoreConnection />
                        </Route>
                        <Route path="/nodes/connect/method/qr-code">
                          <ConnectMethodQrCode />
                        </Route>
                      </Switch>
                    </AnimatedRoute>
                  </Route>
                  <Route path="/inboxes">
                    <Switch>
                      <Route path="/inboxes/create-inbox">
                        <CreateInbox />
                      </Route>
                      <Route path="/inboxes/create-job">
                        <CreateJob />
                      </Route>
                      <Route path="/inboxes/:inboxId">
                        <Inbox />
                      </Route>
                      <Route path="/">
                        <Inboxes />
                      </Route>
                    </Switch>
                  </Route>
                  <Route path="/agents">
                    <Switch>
                      <Route path="/agents/add">
                        <AddAgent />
                      </Route>
                      <Route path="/">
                        <Agents />
                      </Route>
                    </Switch>
                  </Route>
                  <Route path="/settings">
                    <Switch>
                      <Route path="/settings/export-connection">
                        <ExportConnection />
                      </Route>
                      <Route path="/settings/create-registration-code">
                        <CreateRegistrationCode />
                      </Route>
                      <Route path="/">
                        <Settings />
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

const CONTAINER_ID = 'root';
const container = document.getElementById(CONTAINER_ID);
if (!container) {
  throw new Error(`container with id ${CONTAINER_ID} not found`);
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale={locale} messages={langMessages}>
        <div className="font-inter h-full w-full">
          <Router>
            <Popup />
          </Router>
        </div>
      </IntlProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
