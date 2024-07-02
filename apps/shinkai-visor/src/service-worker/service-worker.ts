import './context-menu';

import { listen as listenExternal } from './communication/external';
import { listen as listenInternal } from './communication/internal';

listenInternal();
listenExternal();
