import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Modal from './components/modal/Modal';

import './launcher.css';

var mountNode = document.getElementById('launcher');
ReactDOM.render(<Modal />, mountNode);
