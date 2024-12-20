import { I18nProvider } from '@shinkai_network/shinkai-i18n';
import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { info } from '@tauri-apps/plugin-log';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import FullPageErrorFallback from './components/error-boundary';
import { OAuthConnect } from './components/oauth/oauth-connect';
import { AnalyticsProvider } from './lib/posthog-provider';
import AppRoutes from './routes';
import { useSyncStorageSecondary } from './store/sync-utils';

function App() {
  useEffect(() => {
    info('initializing main');
  }, []);
  useSyncStorageSecondary();
  return (
    <I18nProvider>
      <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
        <AnalyticsProvider>
          <QueryProvider>
            <OAuthConnect />
            <Router>
              <AppRoutes />
            </Router>
            <Toaster />
          </QueryProvider>
        </AnalyticsProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
}

export default App;
