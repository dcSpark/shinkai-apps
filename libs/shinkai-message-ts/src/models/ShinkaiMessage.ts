import { ShinkaiMessage } from '@shinkai_network/shinkai-typescript';

export interface RegistrationCode {
  code: string;
  profileName: string;
  identityPk: string;
  encryptionPk: string;
  permissionType: string;
}

export type SmartInbox = {
  custom_name: string;
  inbox_id: string;
  last_message?: ShinkaiMessage;
};
