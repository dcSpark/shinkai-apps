import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Modal from './components/modal/Modal';

import './launcher.css';

const root = createRoot(document.getElementById('launcher'));
root.render(<Modal />);
