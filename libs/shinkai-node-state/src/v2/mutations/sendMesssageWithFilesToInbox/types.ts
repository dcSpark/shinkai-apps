import type {
  ShinkaiMessage,
} from '@shinkai_network/shinkai-message-ts/models';

export type SendMessageWithFilesToInboxInput = {
  nodeAddress: string;
  token: string;
  message: string;
  jobId: string;
  files: File[];
};

export type SendMessageWithFilesToInboxOutput = {
  message: ShinkaiMessage;
};
