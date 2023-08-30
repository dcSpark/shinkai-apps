import type {
  CredentialsPayload,
  SerializedAgent,
} from '@shinkai_network/shinkai-message-ts/models';

export type UpdateAgentOutput = {
  status: string;
};

export type UpdateAgentInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  agent: SerializedAgent;
};
