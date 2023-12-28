import { TSEncryptionMethod } from '../schemas/schema_types';

export interface InternalMetadata {
  sender_subidentity: string;
  recipient_subidentity: string;
  inbox: string;
  signature: string;
  encryption: keyof typeof TSEncryptionMethod;
}
