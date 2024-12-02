import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { UpdateToolCodeImplementationResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type UpdateToolCodeImplementationInput = Token & {
  nodeAddress: string;
  jobId: string;
  code: string;
};

export type UpdateToolCodeImplementationOutput =
  UpdateToolCodeImplementationResponse;
