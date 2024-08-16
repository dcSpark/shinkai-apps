import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateSheetOutput = {
  status: string;
};

export type RemoveSheetInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  sheetId: string;
};
