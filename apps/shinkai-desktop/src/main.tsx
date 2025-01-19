/* eslint-disable */
// import { scan } from 'react-scan'; // import this BEFORE react
import './globals.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

/*
 Enable react scan for performance monitoring
  */

// if (typeof window !== 'undefined') {
//   scan({
//     enabled: true,
//     trackUnnecessaryRenders: true,
//     // log: true, // logs render info to console (default: false)
//   });
// }

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
