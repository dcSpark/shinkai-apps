import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type AddRowsSheetOutput = {
  status: string;
  data: {
    sheet_id: string;
    status: string;
  };
};

export type AddRowsSheetInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  sheetId: string;
  profile: string;
  numberOfRows: number;
  startingRow: number | undefined;
};
