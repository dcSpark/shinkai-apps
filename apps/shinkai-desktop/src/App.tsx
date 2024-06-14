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
    <AnalyticsProvider>
      <QueryProvider>
        <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
          <Router>
            <AppRoutes />
          </Router>
        </ErrorBoundary>
        <Toaster />
      </QueryProvider>
    </AnalyticsProvider>
  );
}

export default App;
