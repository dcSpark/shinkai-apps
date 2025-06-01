import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

import {
  type ExportInboxMessagesFormat,
  type ExportInboxMessagesRequest,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type ExportMessagesFromInboxInput = Token & {
  nodeAddress: string;
} & ExportInboxMessagesRequest;

export type ExportMessagesFromInboxOutput = Blob;
