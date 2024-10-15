import { I18nProvider } from '@shinkai_network/shinkai-i18n';
import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import FullPageErrorFallback from './components/error-boundary';
import { AnalyticsProvider } from './lib/posthog-provider';
import AppRoutes from './routes';
import { useSyncStorageSecondary } from './store/sync-utils';

function App() {
  useSyncStorageSecondary();
  return (
    <I18nProvider>
      <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
        <AnalyticsProvider>
          <QueryProvider>
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
