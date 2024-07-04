import { JobScope, MessageSchemaType, TSEncryptionMethod } from './SchemaTypes';

export interface InternalMetadata {
  sender_subidentity: string;
  recipient_subidentity: string;
  inbox: string;
  encryption: keyof typeof TSEncryptionMethod;
  node_api_data: NodeApiData;
}

export type NodeApiData = {
  node_message_hash: string;
  node_timestamp: string;
  parent_hash: string;
};

export interface ExternalMetadata {
  sender: string;
  recipient: string;
  scheduled_time: string;
  signature: string;
  other: string;
}

export interface EncryptedShinkaiData {
  content: string;
}

export interface ShinkaiData {
  message_raw_content: string;
  message_content_schema: MessageSchemaType;
}

export type MessageData =
  | { encrypted: EncryptedShinkaiData }
  | { unencrypted: ShinkaiData };

export interface EncryptedShinkaiBody {
  content: string;
}

export interface ShinkaiBody {
  message_data: MessageData;
  internal_metadata: InternalMetadata;
}

export type MessageBody =
  | { encrypted: EncryptedShinkaiBody }
  | { unencrypted: ShinkaiBody };

export interface ShinkaiMessage {
  body: MessageBody | null;
  external_metadata: ExternalMetadata | null;
  encryption: keyof typeof TSEncryptionMethod;
}

export interface RegistrationCode {
  code: string;
  profileName: string;
  identityPk: string;
  encryptionPk: string;
  permissionType: string;
}

export type AgentInbox = {
  full_identity_name: string;
  id: string;
  model: string;
};

export type SmartInbox = {
  custom_name: string;
  inbox_id: string;
  last_message?: ShinkaiMessage;
  is_finished: boolean;
  job_scope?: JobScope;
  agent?: AgentInbox;
};

export type CreateChatInboxResponse = {
  status: string;
  message: string;
  data: {
    message_id: string;
    parent_message_id: string | null;
    inbox: string;
    scheduled_time: string;
  };
};
