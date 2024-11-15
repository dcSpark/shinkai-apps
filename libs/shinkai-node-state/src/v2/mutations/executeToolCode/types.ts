import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ExecuteToolCodeResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ExecuteToolCodeInput = Token & {
  nodeAddress: string;
  toolType?: string;
  toolRouterKey?: string;
  params: Record<string, any>;
  code: string;
};

export type ExecuteToolCodeOutput = ExecuteToolCodeResponse;
