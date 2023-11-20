import type {
  AgentCredentialsPayload,
  SerializedAgent,
} from "@shinkai_network/shinkai-message-ts/models";

export type CreateAgentInput = {
  sender_subidentity: string;
  node_name: string;
  agent: SerializedAgent;
  setupDetailsState: AgentCredentialsPayload;
};
