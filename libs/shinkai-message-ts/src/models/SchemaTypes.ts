export enum EncryptionMethod {
  DiffieHellmanChaChaPoly1305 = "DiffieHellmanChaChaPoly1305",
  None = "None",
}

export enum MessageSchemaType {
  JobCreationSchema = "JobCreationSchema",
  JobMessageSchema = "JobMessageSchema",
  PreMessageSchema = "PreMessageSchema",
  CreateRegistrationCode = "CreateRegistrationCode",
  UseRegistrationCode = "UseRegistrationCode",
  APIGetMessagesFromInboxRequest = "APIGetMessagesFromInboxRequest",
  APIReadUpToTimeRequest = "APIReadUpToTimeRequest",
  APIAddAgentRequest = "APIAddAgentRequest",
  TextContent = "TextContent",
  Empty = "",
}

export interface JobScope {
  buckets: string[];
  documents: string[];
}

export interface JobCreation {
  scope: JobScope;
}

export interface JobMessage {
  job_id: string;
  content: string;
}

export interface JobToolCall {
  tool_id: string;
  inputs: Record<string, string>;
}

export enum JobRecipient {
  SelfNode = "SelfNode",
  User = "User",
  ExternalIdentity = "ExternalIdentity",
}

export interface JobPreMessage {
  tool_calls: JobToolCall[];
  content: string;
  recipient: JobRecipient;
}

export interface APIGetMessagesFromInboxRequest {
  inbox: string;
  count: number;
  offset?: string;
}

export interface APIReadUpToTimeRequest {
  inbox_name: string;
  up_to_time: string;
}

export interface SerializedAgent {
  id: string;
  full_identity_name: string; // ShinkaiName
  perform_locally: boolean;
  external_url?: string;
  api_key?: string;
  model: AgentAPIModel;
  toolkit_permissions: string[];
  storage_bucket_permissions: string[];
  allowed_message_senders: string[];
}
export interface AgentAPIModel {
  OpenAI?: OpenAI;
  SleepAPI?: SleepAPI;
}

export interface OpenAI {
  model_type: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SleepAPI {}

export interface APIAddAgentRequest {
  agent: SerializedAgent;
}
