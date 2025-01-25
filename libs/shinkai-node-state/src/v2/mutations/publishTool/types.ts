import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { PublishToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type PublishToolOutput = PublishToolResponse;

export type PublishToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};
