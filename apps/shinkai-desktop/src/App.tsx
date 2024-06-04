import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { BrowserRouter as Router } from 'react-router-dom';

import { AnalyticsProvider } from './lib/posthog-provider';
import { ShinkaiNodeRunningOverlay } from './lib/shinkai-node-provider';
import AppRoutes from './routes';
import { initSyncStorage } from './store/sync-utils';

initSyncStorage();

function App() {
  return (
    <AnalyticsProvider>
      <QueryProvider>
        <ShinkaiNodeRunningOverlay>
          <Router>
            <AppRoutes />
          </Router>
          <Toaster />
        </ShinkaiNodeRunningOverlay>
      </QueryProvider>
    </AnalyticsProvider>
  );
}

export default App;
