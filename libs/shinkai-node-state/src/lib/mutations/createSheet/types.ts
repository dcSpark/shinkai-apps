import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateSheetOutput = {
  status: string;
  data: {
    sheet_id: string;
    status: string;
  };
};

export type CreateSheetInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  sheetName: string;
};
