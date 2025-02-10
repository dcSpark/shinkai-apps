import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetQuestsStatusResponse } from '@shinkai_network/shinkai-message-ts/api/quests/types';

export type GetQuestsStatusInput = Token & {
  nodeAddress: string;
};

export type GetQuestsStatusOutput = GetQuestsStatusResponse;
