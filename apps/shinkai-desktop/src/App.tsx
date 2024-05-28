import { Toaster } from '@shinkai_network/shinkai-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';

// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRoutes from './routes';
import { initSyncStorage } from './store/sync-utils';

const queryClient = new QueryClient();

initSyncStorage();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
