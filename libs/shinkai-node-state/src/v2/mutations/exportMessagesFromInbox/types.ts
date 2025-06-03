import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type ExportMessagesFromInboxInput = Token & {
  nodeAddress: string;
  inboxId: string;
  format: 'csv' | 'json' | 'txt';
};

export type ExportMessagesFromInboxOutput = Blob;
