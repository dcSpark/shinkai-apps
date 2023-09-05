import { EncryptionMethod, MessageSchemaType } from "./SchemaTypes";

export interface InternalMetadata {
  sender_subidentity: string;
  recipient_subidentity: string;
  inbox: string;
  encryption: EncryptionMethod;
}

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

export type MessageData = { encrypted: EncryptedShinkaiData } | { unencrypted: ShinkaiData };

export interface EncryptedShinkaiBody {
  content: string;
}

export interface ShinkaiBody {
  message_data: MessageData;
  internal_metadata: InternalMetadata;
}

export type MessageBody = { encrypted: EncryptedShinkaiBody } | { unencrypted: ShinkaiBody };

export interface ShinkaiMessage {
  body: MessageBody | null;
  external_metadata: ExternalMetadata | null;
  encryption: EncryptionMethod;
}

export interface RegistrationCode {
  code: string;
  profileName: string;
  identityPk: string;
  encryptionPk: string;
  permissionType: string;
}
