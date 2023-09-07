import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter as Router } from 'react-router-dom';

// import App from './App';

const container = document.getElementById('root')
if (!container) {
  throw new Error('root container not found');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Router>
      {/* <App /> */}
      <span>patata2</span>
    </Router>
  </React.StrictMode>
);
