import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';

import { ResourcesBanner } from './components/hardware-capabilities/resources-banner';
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRoutes from './routes';
import { initSyncStorage } from './store/sync-utils';

initSyncStorage();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <ResourcesBanner />
    </QueryClientProvider>
  );
}

export default App;
