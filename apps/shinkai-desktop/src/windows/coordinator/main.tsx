import { info } from '@tauri-apps/plugin-log';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

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
  return null;
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
