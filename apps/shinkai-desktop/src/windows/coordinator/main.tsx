import React from 'react';
import ReactDOM from 'react-dom/client';

import { useSyncStorageMain } from '../../store/sync-utils';

const App = () => {
  useSyncStorageMain();
  return null;
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
