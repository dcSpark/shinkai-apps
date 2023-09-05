import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter as Router } from 'react-router-dom';

import App from './App';

const root = createRoot(document.getElementById('popup'));
root.render(  <React.StrictMode>
  <Router>
    <App />
  </Router>
</React.StrictMode>);
