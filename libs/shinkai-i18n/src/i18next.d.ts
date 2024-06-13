import 'i18next';

import { Resources } from './lib/resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ns1';
    resources: Resources;
  }
}
