import { QueryClientProvider } from '@tanstack/react-query';
import { info } from '@tauri-apps/plugin-log';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import { useOAuthDeepLink } from '../../hooks/use-oauth-deep-link';
import { shinkaiNodeQueryClient } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import {
  useSyncStorageMain,
  useSyncStorageSecondary,
  useSyncStorageSideEffects,
} from '../../store/sync-utils';

const App = () => {
  useEffect(() => {
    info('initializing coordinator');
  }, []);
  useSyncStorageMain();
  useSyncStorageSecondary();
  useSyncStorageSideEffects();
  useOAuthDeepLink();

  return null;
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={shinkaiNodeQueryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
