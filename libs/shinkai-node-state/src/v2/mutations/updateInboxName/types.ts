import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { UpdateInboxNameResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type UpdateInboxNameInput = Token & {
  nodeAddress: string;
  inboxName: string;
  inboxId: string;
};

export type UpdateInboxNameOutput = UpdateInboxNameResponse;
