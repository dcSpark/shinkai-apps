import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

import { Attachment } from '../getChatConversation/types';

export type GetShinkaiFileProtocolInput = Token & {
  nodeAddress: string;
  file: string;
};

export type GetShinkaiFileProtocolOutput = Blob;

export type GetShinkaiFilesProtocolInput = Token & {
  nodeAddress: string;
  files: string[];
};

export type GetShinkaiFilesProtocolOutput = Attachment[];
