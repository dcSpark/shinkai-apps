import { I18nProvider } from '@shinkai/shinkai-i18n';
import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter as Router } from 'react-router-dom';

import FullPageErrorFallback from './components/error-boundary';
import { AnalyticsProvider } from './lib/posthog-provider';
import AppRoutes from './routes';
import { initSyncStorage } from './store/sync-utils';

initSyncStorage();

function App() {
  return (
    <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
      <AnalyticsProvider>
        <QueryProvider>
          <I18nProvider>
            <Router>
              <AppRoutes />
            </Router>
          </I18nProvider>
          <Toaster />
        </QueryProvider>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default App;
