import { QueryClientProvider } from '@tanstack/react-query';
import { info } from '@tauri-apps/plugin-log';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import { useOAuthDeepLinkSet } from '../../hooks/oauth';
import { shinkaiNodeQueryClient } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import {
  useSyncStorageMain,
  useSyncStorageSecondary,
  useSyncStorageSideEffects,
} from '../../store/sync-utils';

const App = () => {
  useEffect(() => {
    void info('initializing coordinator');
  }, []);
  useSyncStorageMain();
  useSyncStorageSecondary();
  useSyncStorageSideEffects();
  useOAuthDeepLinkSet();

  return null;
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={shinkaiNodeQueryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
