import './context-menu';

import { listen as listenExternal } from './communication/external';
import { listen as listenInternal } from './communication/internal';

listenInternal();
// TODO: need to refactor async await
// ERROR: Top-level await is disallowed in service worker (ONLY REPRODUCED IN LOCAL DEV)
listenExternal();
