import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type RemoveSheetColumnOutput = {
  status: string;
  data: {
    sheet_id: string;
    status: string;
  };
};

export type RemoveSheetColumnInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  sheetId: string;
  columnId: string;
};
