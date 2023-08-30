import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MemoryRouter as Router } from 'react-router-dom';

import App from './App';

var mountNode = document.getElementById('popup');
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  mountNode
);
