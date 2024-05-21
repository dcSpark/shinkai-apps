import '../../theme/styles.css';

import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { PrimeReactProvider } from 'primereact/api';
import * as React from 'react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { MemoryRouter as Router } from 'react-router-dom';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useGlobalPopupChromeMessage } from '../../hooks/use-global-popup-chrome-message';
import { langMessages, locale } from '../../lang/intl';
import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { AddAgent } from '../agents/add-agent';
import { Agents } from '../agents/agents';
import { AnimatedRoute } from '../animated-route/animated-routed';
import { ConnectMethodQrCode } from '../connect-method-qr-code/connect-method-qr-code';
import { ConnectMethodQuickStart } from '../connect-method-quick-start/connect-method-quick-start';
import { ConnectMethodRestoreConnection } from '../connect-method-restore-connection/connect-method-restore-connection';
import { CreateInbox } from '../create-inbox/create-inbox';
import { CreateJob } from '../create-job/create-job';
import { CreateRegistrationCode } from '../create-registration-code/create-registration-code';
import { ExportConnection } from '../export-connection/export-connection';
import { Inbox } from '../inbox/inbox';
import { Inboxes } from '../inboxes/inboxes';
import { VectorFolderSelectionProvider } from '../node-files/folder-selection-list';
import { VectorFsProvider } from '../node-files/node-file-context';
import NodeFiles from '../node-files/node-files';
import { PublicKeys } from '../public-keys/public-keys';
import SearchNodeFiles from '../search-node-files/search-node-files';
import { Settings } from '../settings/settings';
import { SplashScreen } from '../splash-screen/splash-screen';
import SharedFolderSubscription from '../subscriptions/public-shared-folders';
import MySubscriptions from '../subscriptions/subscriptions';
import Welcome from '../welcome/welcome';
import { WithNav } from '../with-nav/with-nav';

export const Popup = () => {
  const navigate = useNavigate();
  const auth = useAuth((state) => state.auth);
  const location = useLocation();
  useGlobalPopupChromeMessage();
  const lastPage = useSettings((state) => state.lastPage);

  const isAuthenticated = !!auth;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/welcome');
      return;
    }
    if (!lastPage) {
      navigate('/inboxes');
      return;
    }
    navigate(lastPage);
  }, [navigate, isAuthenticated, lastPage]);

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="flex h-full w-full flex-col bg-gray-500 px-6 pb-6 pt-8 shadow-xl"
        data-testid="popup"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Routes key={location.pathname} location={location}>
          <Route path="/">
            <AnimatedRoute>
              <SplashScreen />
            </AnimatedRoute>
          </Route>
          <Route path="/welcome">
            <AnimatedRoute>
              <Welcome />
            </AnimatedRoute>
          </Route>

          <Route path="*">
            <AnimatedRoute>
              <WithNav>
                <Route path="/nodes">
                  <AnimatedRoute>
                    <Routes>
                      <Route path="/nodes/connect/method/quick-start">
                        <ConnectMethodQuickStart />
                      </Route>
                      <Route path="/nodes/connect/method/restore-connection">
                        <ConnectMethodRestoreConnection />
                      </Route>
                      <Route path="/nodes/connect/method/qr-code">
                        <ConnectMethodQrCode />
                      </Route>
                    </Routes>
                  </AnimatedRoute>
                </Route>
                <Route path="/inboxes">
                  <Routes>
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
                  </Routes>
                </Route>
                <Route path="/node-files">
                  <Routes>
                    <Route path="/">
                      <VectorFsProvider>
                        <NodeFiles />
                      </VectorFsProvider>
                    </Route>
                  </Routes>
                </Route>
                <Route path="/search-node-files">
                  <Routes>
                    <Route path="/">
                      <VectorFolderSelectionProvider>
                        <SearchNodeFiles />
                      </VectorFolderSelectionProvider>
                    </Route>
                  </Routes>
                </Route>
                <Route path="/subscriptions">
                  <Routes>
                    <Route path="/subscriptions/public">
                      <SharedFolderSubscription />
                    </Route>
                    <Route path="/">
                      <MySubscriptions />
                    </Route>
                  </Routes>
                </Route>
                <Route path="/agents">
                  <Routes>
                    <Route path="/agents/add">
                      <AddAgent />
                    </Route>
                    <Route path="/">
                      <Agents />
                    </Route>
                  </Routes>
                </Route>
                <Route path="/settings">
                  <Routes>
                    <Route path="/settings/export-connection">
                      <ExportConnection />
                    </Route>
                    <Route path="/settings/public-keys">
                      <PublicKeys />
                    </Route>
                    <Route path="/settings/create-registration-code">
                      <CreateRegistrationCode />
                    </Route>
                    <Route path="/">
                      <Settings />
                    </Route>
                  </Routes>
                </Route>
              </WithNav>
            </AnimatedRoute>
          </Route>
        </Routes>
      </motion.div>
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
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale={locale} messages={langMessages}>
          <div className="font-inter h-full w-full">
            <Router>
              <Popup />
            </Router>
          </div>
          <Toaster />
        </IntlProvider>
        {/*<ReactQueryDevtools initialIsOpen={false} />*/}
      </QueryClientProvider>
    </PrimeReactProvider>
  </React.StrictMode>,
);
