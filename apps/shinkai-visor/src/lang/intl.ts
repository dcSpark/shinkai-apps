import { MessageFormatElement } from 'react-intl';

import english from './en.json';
import spanish from './es.json';

type LangMessage = Record<string, MessageFormatElement[]>;
const langMap = new Map<string, LangMessage>([
  ['en', english as unknown as LangMessage],
  ['es', spanish as unknown as LangMessage],
]);
const DEFAULT_LOCALE = 'en';

export const locale = navigator.language || DEFAULT_LOCALE;
export const langMessages: LangMessage =
  langMap.get(locale) || (english as unknown as LangMessage);
