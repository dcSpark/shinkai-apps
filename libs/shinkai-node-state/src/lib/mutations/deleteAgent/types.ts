import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type DeleteAgentOutput = {
  status: string;
};

export type DeleteAgentInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  agentId: string;
};
