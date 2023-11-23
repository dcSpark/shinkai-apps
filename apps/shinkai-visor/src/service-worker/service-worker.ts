import './context-menu';
import './shortcuts';
import './action';

import { listen as listenInternal } from './communication/external';
import { listen as listenExternal } from './communication/internal';

listenInternal();
listenExternal();
