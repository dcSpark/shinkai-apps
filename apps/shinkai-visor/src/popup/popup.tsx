import '../theme/styles.css';
import './popup.css';

import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { PopupApp } from '../components/popup-app/popup-app';


const container = document.getElementById('root');
if (!container) {
  throw new Error('root container not found');
}
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <PopupApp></PopupApp>
  </React.StrictMode>
);
