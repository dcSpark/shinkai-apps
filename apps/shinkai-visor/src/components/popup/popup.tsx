import '../../theme/styles.css';

import { I18nProvider } from '@shinkai_network/shinkai-i18n';
import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { PrimeReactProvider } from 'primereact/api';
import * as React from 'react';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter as Router } from 'react-router-dom';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useGlobalPopupChromeMessage } from '../../hooks/use-global-popup-chrome-message';
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
  }, [isAuthenticated, lastPage]);

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
          <Route
            element={
              <AnimatedRoute>
                <SplashScreen />
              </AnimatedRoute>
            }
            path="/"
          />
          <Route
            element={
              <AnimatedRoute>
                <Welcome />
              </AnimatedRoute>
            }
            path="/welcome"
          />

          <Route
            element={
              <AnimatedRoute>
                <WithNav />
              </AnimatedRoute>
            }
          >
            <Route path="/nodes">
              <Route
                element={<ConnectMethodQuickStart />}
                path="connect/method/quick-start"
              />
              <Route
                element={<ConnectMethodRestoreConnection />}
                path="connect/method/restore-connection"
              />
              <Route
                element={<ConnectMethodQrCode />}
                path="connect/method/qr-code"
              />
            </Route>
            <Route path="inboxes">
              <Route element={<CreateInbox />} path="create-inbox" />
              <Route element={<CreateJob />} path="create-job" />
              <Route element={<Inbox />} path=":inboxId" />
              <Route element={<Inboxes />} index />
            </Route>
            <Route path="node-files">
              <Route
                element={
                  <VectorFsProvider>
                    <NodeFiles />
                  </VectorFsProvider>
                }
                index
              />
            </Route>
            <Route path="search-node-files">
              <Route
                element={
                  <VectorFolderSelectionProvider>
                    <SearchNodeFiles />
                  </VectorFolderSelectionProvider>
                }
                index
              />
            </Route>
            <Route path="subscriptions">
              <Route element={<SharedFolderSubscription />} path="public" />
              <Route element={<MySubscriptions />} index />
            </Route>
            <Route path="agents">
              <Route element={<AddAgent />} path="add" />
              <Route element={<Agents />} index />
            </Route>
            <Route path="settings">
              <Route element={<ExportConnection />} path="export-connection" />
              <Route element={<PublicKeys />} path="public-keys" />
              <Route
                element={<CreateRegistrationCode />}
                path="create-registration-code"
              />
              <Route element={<Settings />} index />
            </Route>
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
    <I18nProvider>
      <PrimeReactProvider>
        <QueryProvider>
          <div className="font-inter h-full w-full">
            <Router>
              <Popup />
            </Router>
          </div>
          <Toaster />
        </QueryProvider>
      </PrimeReactProvider>
    </I18nProvider>
  </React.StrictMode>,
);
