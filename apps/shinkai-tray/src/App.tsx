import { queryClient } from '@shinkai_network/shinkai-node-state/lib/constants';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';

// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRoutes from './routes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
