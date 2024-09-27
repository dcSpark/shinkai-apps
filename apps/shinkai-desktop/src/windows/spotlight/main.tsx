import './globals.css';

import { I18nProvider } from '@shinkai_network/shinkai-i18n';
import { QueryProvider } from '@shinkai_network/shinkai-node-state';
import { Toaster } from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import FullPageErrorFallback from '../../components/error-boundary';
import { shinkaiNodeQueryClient } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeEventsToast } from '../../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { initSyncStorage } from '../../store/sync-utils';
import QuickAsk from './components/quick-ask';

initSyncStorage();

const App = () => {
  useShinkaiNodeEventsToast();

  return (
    <I18nProvider>
      <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
        <QueryProvider>
          <QuickAsk />
          <Toaster />
        </QueryProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <QueryClientProvider client={shinkaiNodeQueryClient}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </QueryClientProvider>,
);
