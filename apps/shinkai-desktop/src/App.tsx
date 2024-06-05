import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { BrowserRouter as Router } from 'react-router-dom';

import { AnalyticsProvider } from './lib/posthog-provider';
import AppRoutes from './routes';
import { initSyncStorage } from './store/sync-utils';

initSyncStorage();

function App() {
  return (
    <AnalyticsProvider>
      <QueryProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryProvider>
    </AnalyticsProvider>
  );
}

export default App;
