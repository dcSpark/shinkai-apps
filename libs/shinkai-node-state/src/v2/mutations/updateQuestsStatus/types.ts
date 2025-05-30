import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type UpdateQuestsStatusResponse } from '@shinkai_network/shinkai-message-ts/api/quests/types';

export type UpdateQuestsStatusInput = Token & {
  nodeAddress: string;
};

export type UpdateQuestsStatusOutput = UpdateQuestsStatusResponse;
