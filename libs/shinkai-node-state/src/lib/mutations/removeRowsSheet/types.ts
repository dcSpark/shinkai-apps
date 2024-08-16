import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type RemoveRowsSheetOutput = {
  status: string;
  data: {
    sheet_id: string;
    status: string;
  };
};

export type RemoveRowsSheetInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  sheetId: string;
  rowIds: string[];
};
